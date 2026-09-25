import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, MoreThan, Repository } from 'typeorm';
import type { carRental } from '@car-rental/contracts';
import { Car } from '../cars/entity/car.entity';
import {
  addDays,
  DateRange,
  daysBetween,
  parseDateRange,
  today,
} from '../common/date-range';
import {
  failedPrecondition,
  invalidArgument,
  notFound,
} from '../common/rpc-errors';
import { Booking, BookingStatus } from './entity/booking.entity';
import { BookingEventsPublisher } from './booking-events.publisher';
import { toBooking } from './booking.mapper';

// Конец непрерывной занятости, если она пересекает период. Иначе авто свободно.
const contiguousReleaseDate = (
  bookings: { startDate: string; endDate: string }[],
  range: DateRange,
): string | null => {
  const overlapping = bookings.find(
    (booking) => booking.startDate < range.end && booking.endDate > range.start,
  );
  if (!overlapping) {
    return null;
  }

  let until = overlapping.endDate;
  for (const booking of bookings) {
    if (booking.startDate <= until && booking.endDate > until) {
      until = booking.endDate;
    }
  }
  return until;
};

// Активные брони, пересекающиеся с периодом: [a, b) и [c, d) пересекаются, если a < d и b > c
const activeOverlapping = (range: DateRange) => ({
  status: BookingStatus.Active,
  startDate: LessThan(range.end),
  endDate: MoreThan(range.start),
});

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly dataSource: DataSource,
    private readonly eventsPublisher: BookingEventsPublisher,
  ) {}

  // Для занятых авто — дата, когда машина снова свободна.
  // Склеенные брони (следующая начинается в день окончания предыдущей) считаются одним сроком.
  async findUnavailableUntil(
    carIds: number[],
    range: DateRange,
  ): Promise<Map<number, string>> {
    if (!carIds.length) {
      return new Map();
    }

    const bookings = await this.bookingsRepository.find({
      select: { carId: true, startDate: true, endDate: true },
      where: {
        carId: In(carIds),
        status: BookingStatus.Active,
        endDate: MoreThan(range.start),
      },
      order: { carId: 'ASC', startDate: 'ASC' },
    });

    const byCar = new Map<number, { startDate: string; endDate: string }[]>();
    for (const { carId, startDate, endDate } of bookings) {
      const carBookings = byCar.get(carId);
      if (carBookings) {
        carBookings.push({ startDate, endDate });
      } else {
        byCar.set(carId, [{ startDate, endDate }]);
      }
    }

    const unavailableUntil = new Map<number, string>();
    for (const [carId, carBookings] of byCar) {
      const releaseDate = contiguousReleaseDate(carBookings, range);
      if (releaseDate) {
        unavailableUntil.set(carId, releaseDate);
      }
    }
    return unavailableUntil;
  }

  async create({
    carId,
    startDate,
    endDate,
    customer,
  }: carRental.CreateBookingRequest): Promise<carRental.CreateBookingResponse> {
    if (!customer) {
      throw invalidArgument('Customer is required');
    }
    const range = parseDateRange(startDate, endDate);

    const booking = await this.dataSource.transaction(async (manager) => {
      // Блокировка строки авто: параллельные брони одной машины выполняются по очереди,
      // поэтому проверка пересечений и вставка не могут «проскочить» друг мимо друга
      const car = await manager.findOne(Car, {
        where: { id: carId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!car) {
        throw notFound('Car not found');
      }

      const isBusy = await manager.exists(Booking, {
        where: { carId, ...activeOverlapping(range) },
      });
      if (isBusy) {
        throw failedPrecondition('Car is not available for the selected dates');
      }

      return manager.save(
        manager.create(Booking, {
          car,
          userId: customer.id,
          startDate: range.start,
          endDate: range.end,
          totalPrice: range.days * car.pricePerDay,
        }),
      );
    });

    this.eventsPublisher.carBooked(booking, customer);

    return { booking: toBooking(booking) };
  }

  async listByUser({
    userId,
  }: carRental.ListUserBookingsRequest): Promise<carRental.ListUserBookingsResponse> {
    const bookings = await this.bookingsRepository.find({
      where: { userId },
      relations: { car: true },
      order: { startDate: 'DESC' },
    });
    return { bookings: bookings.map(toBooking) };
  }

  // Будущая бронь отменяется целиком. Идущая аренда завершается досрочно:
  // сегодня — последний оплачиваемый день, авто свободно с завтрашнего дня
  async cancel({
    bookingId,
    customer,
  }: carRental.CancelBookingRequest): Promise<carRental.CancelBookingResponse> {
    if (!customer) {
      throw invalidArgument('Customer is required');
    }

    // Чужая бронь неотличима от несуществующей: не раскрываем чужие id
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, userId: customer.id },
      relations: { car: true },
    });
    if (!booking) {
      throw notFound('Booking not found');
    }
    if (booking.status === BookingStatus.Cancelled) {
      throw failedPrecondition('Booking is already cancelled');
    }

    const now = today();
    if (booking.endDate <= now) {
      throw failedPrecondition('A completed booking cannot be cancelled');
    }

    const endedEarly = booking.startDate <= now;
    if (endedEarly) {
      this.endEarly(booking, addDays(now, 1));
    } else {
      booking.status = BookingStatus.Cancelled;
    }
    await this.bookingsRepository.save(booking);

    this.eventsPublisher.bookingCancelled(booking, customer, endedEarly);

    return { booking: toBooking(booking) };
  }

  // Цена пересчитывается по ставке из брони, а не по текущему тарифу авто
  private endEarly(booking: Booking, endDate: string) {
    if (endDate >= booking.endDate) {
      throw failedPrecondition('Today is already the last day of this rental');
    }

    const dailyRate =
      booking.totalPrice / daysBetween(booking.startDate, booking.endDate);
    booking.endDate = endDate;
    booking.totalPrice = Math.round(
      dailyRate * daysBetween(booking.startDate, endDate),
    );
  }
}
