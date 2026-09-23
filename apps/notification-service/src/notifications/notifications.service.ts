import { Injectable, Logger } from '@nestjs/common';
import type { CarBookedEvent } from '@car-rental/contracts';
import { MailService } from '../mail/mail.service';
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
}
