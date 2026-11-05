import { Injectable, Logger } from '@nestjs/common';
import type {
  BookingCancelledEvent,
  BookingEventDetails,
  CarBookedEvent,
} from '@car-rental/contracts';
import type { MailMessage } from '../mail/mail.service';
import { AiEmailClient } from './ai-email.client';
import {
  carName,
  formatDate,
  formatPrice,
  renderBookingEmail,
  type BookingEmailContent,
} from './templates/booking-email';
import { bookingCancelledContent } from './templates/booking-cancelled.template';
import { carBookedContent } from './templates/car-booked.template';

export interface ComposedEmail {
  source: 'ai' | 'template';
  message: Omit<MailMessage, 'to'>;
}

// Модель пишет тему и вступление. Таблица фактов всегда берётся из события.
// Если модель не настроена или не ответила — уходит целиком шаблонное письмо.
@Injectable()
export class BookingEmailComposer {
  private readonly logger = new Logger(BookingEmailComposer.name);

  constructor(private readonly aiEmail: AiEmailClient) {}

  composeCarBooked(event: CarBookedEvent): Promise<ComposedEmail> {
    return this.compose(
      event,
      'Бронь только что создана. Нужно письмо-подтверждение.',
      carBookedContent(event),
    );
  }

  composeCancelled(event: BookingCancelledEvent): Promise<ComposedEmail> {
    const situation = event.endedEarly
      ? 'Аренда уже шла и завершена досрочно. Дата возврата и стоимость уже пересчитаны.'
      : 'Будущая бронь отменена.';

    return this.compose(event, situation, bookingCancelledContent(event));
  }

  private async compose(
    event: BookingEventDetails,
    situation: string,
    content: BookingEmailContent,
  ): Promise<ComposedEmail> {
    const copy = await this.aiEmail.composeCopy({
      bookingId: event.bookingId,
      situation,
      facts: bookingFacts(event),
    });

    if (!copy) {
      this.logger.log(`Template email for booking ${event.bookingId}`);
      return {
        source: 'template',
        message: renderBookingEmail(event, content),
      };
    }

    this.logger.log(`AI email for booking ${event.bookingId}`);
    return {
      source: 'ai',
      message: renderBookingEmail(event, {
        ...content,
        subject: copy.subject,
        intro: copy.intro,
      }),
    };
  }
}

const bookingFacts = (event: BookingEventDetails) =>
  [
    `Клиент: ${event.customer.name}`,
    `Автомобиль: ${carName(event)}`,
    `Дата получения: ${formatDate(event.startDate)}`,
    `Дата возврата: ${formatDate(event.endDate)}`,
    `Стоимость: ${formatPrice(event.totalPrice)}`,
    `Номер брони: ${event.bookingId}`,
  ].join('\n');
