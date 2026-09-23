import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import {
  CAR_BOOKED_EVENT,
  type CarBookedEvent,
  type carRental,
} from '@car-rental/contracts';
import { Booking } from './entity/booking.entity';

export const EVENTS_CLIENT = 'EVENTS_CLIENT';

@Injectable()
export class BookingEventsPublisher {
  private readonly logger = new Logger(BookingEventsPublisher.name);

  constructor(@Inject(EVENTS_CLIENT) private readonly client: ClientProxy) {}

  // Публикуем после коммита и не ждём брокер: бронь уже сохранена.
  // Если RabbitMQ недоступен, событие теряется — гарантию доставки даст паттерн Outbox.
  carBooked(booking: Booking, customer: carRental.Customer) {
    const event: CarBookedEvent = {
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
    };

    this.client.emit(CAR_BOOKED_EVENT, event).subscribe({
      error: (error: unknown) =>
        this.logger.error(
          `Failed to publish ${CAR_BOOKED_EVENT} for booking ${booking.id}`,
          error instanceof Error ? error.stack : error,
        ),
    });
  }
}
