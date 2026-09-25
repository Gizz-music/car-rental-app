import { Injectable, Logger } from '@nestjs/common';
import type {
  BookingCancelledEvent,
  CarBookedEvent,
} from '@car-rental/contracts';
import { MailService } from '../mail/mail.service';
import { bookingCancelledEmail } from './templates/booking-cancelled.template';
import { carBookedEmail } from './templates/car-booked.template';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly mailService: MailService) {}

  async notifyCarBooked(event: CarBookedEvent): Promise<void> {
    await this.mailService.send({
      to: event.customer.email,
      ...carBookedEmail(event),
    });
    this.logger.log(`Booking confirmation sent for booking ${event.bookingId}`);
  }

  async notifyBookingCancelled(event: BookingCancelledEvent): Promise<void> {
    await this.mailService.send({
      to: event.customer.email,
      ...bookingCancelledEmail(event),
    });
    this.logger.log(
      `Cancellation notice sent for booking ${event.bookingId} (ended early: ${event.endedEarly})`,
    );
  }
}
