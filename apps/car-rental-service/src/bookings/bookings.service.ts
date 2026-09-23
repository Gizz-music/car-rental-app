import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import type { carRental } from '@car-rental/contracts';
import { Car } from '../cars/entity/car.entity';
import { DateRange, parseDateRange, today } from '../common/date-range';
import {
  failedPrecondition,
  invalidArgument,
  notFound,
} from '../common/rpc-errors';
import { Booking, BookingStatus } from './entity/booking.entity';
import { BookingEventsPublisher } from './booking-events.publisher';
import { toBooking } from './booking.mapper';

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

  async findBusyCarIds(range: DateRange): Promise<Set<number>> {
    const bookings = await this.bookingsRepository.find({
      select: { carId: true },
      where: activeOverlapping(range),
    });
    return new Set(bookings.map(({ carId }) => carId));
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

  async cancel({
    bookingId,
    userId,
  }: carRental.CancelBookingRequest): Promise<carRental.CancelBookingResponse> {
    // Чужая бронь неотличима от несуществующей: не раскрываем чужие id
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, userId },
      relations: { car: true },
    });
    if (!booking) {
      throw notFound('Booking not found');
    }
    if (booking.status === BookingStatus.Cancelled) {
      throw failedPrecondition('Booking is already cancelled');
    }
    if (booking.startDate <= today()) {
      throw failedPrecondition(
        'A booking that has started cannot be cancelled',
      );
    }

    booking.status = BookingStatus.Cancelled;
    await this.bookingsRepository.save(booking);

    return { booking: toBooking(booking) };
  }
}
