import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import {
  BOOKING_CANCELLED_EVENT,
  type BookingCancelledEvent,
  type BookingEventDetails,
  CAR_BOOKED_EVENT,
  type CarBookedEvent,
  type carRental,
} from '@car-rental/contracts';
import { Booking } from './entity/booking.entity';

export const EVENTS_CLIENT = 'EVENTS_CLIENT';

const toEventDetails = (
  booking: Booking,
  customer: carRental.Customer,
): BookingEventDetails => ({
  bookingId: booking.id,
  car: {
    id: booking.car.id,
    brand: booking.car.brand,
    model: booking.car.model,
  },
  startDate: booking.startDate,
  endDate: booking.endDate,
  totalPrice: booking.totalPrice,
  customer: { id: customer.id, email: customer.email, name: customer.name },
});

@Injectable()
export class BookingEventsPublisher {
  private readonly logger = new Logger(BookingEventsPublisher.name);

  constructor(@Inject(EVENTS_CLIENT) private readonly client: ClientProxy) {}

  carBooked(booking: Booking, customer: carRental.Customer) {
    const event: CarBookedEvent = toEventDetails(booking, customer);
    this.publish(CAR_BOOKED_EVENT, event);
  }

  bookingCancelled(
    booking: Booking,
    customer: carRental.Customer,
    endedEarly: boolean,
  ) {
    const event: BookingCancelledEvent = {
      ...toEventDetails(booking, customer),
      endedEarly,
    };
    this.publish(BOOKING_CANCELLED_EVENT, event);
  }

  // Публикуем после коммита и не ждём брокер: изменения брони уже сохранены.
  // Если RabbitMQ недоступен, событие теряется — гарантию доставки даст паттерн Outbox.
  private publish(pattern: string, event: BookingEventDetails) {
    this.client.emit(pattern, event).subscribe({
      error: (error: unknown) =>
        this.logger.error(
          `Failed to publish ${pattern} for booking ${event.bookingId}`,
          error instanceof Error ? error.stack : error,
        ),
    });
  }
}
