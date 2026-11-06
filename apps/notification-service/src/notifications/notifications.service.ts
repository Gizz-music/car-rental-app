import { Injectable, Logger } from '@nestjs/common';
import type {
  BookingCancelledEvent,
  CarBookedEvent,
} from '@car-rental/contracts';
import { MailService } from '../mail/mail.service';
import { BookingEmailComposer } from './booking-email.composer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly emails: BookingEmailComposer,
  ) {}

  async notifyCarBooked(event: CarBookedEvent): Promise<void> {
    const email = await this.emails.composeCarBooked(event);
    await this.mailService.send({
      to: event.customer.email,
      ...email.message,
    });
    this.logger.log(
      `Booking confirmation sent for booking ${event.bookingId} (${email.source})`,
    );
  }

  async notifyBookingCancelled(event: BookingCancelledEvent): Promise<void> {
    const email = await this.emails.composeCancelled(event);
    await this.mailService.send({
      to: event.customer.email,
      ...email.message,
    });
    this.logger.log(
      `Cancellation notice sent for booking ${event.bookingId} (${email.source})`,
    );
  }
}
