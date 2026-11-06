import type { BookingCancelledEvent } from '@car-rental/contracts';
import {
  type BookingEmailContent,
  carName,
  formatDate,
} from './booking-email';

export const bookingCancelledContent = (
  event: BookingCancelledEvent,
): BookingEmailContent => ({
  subject: `Бронирование №${event.bookingId} отменено: ${carName(event)}`,
  intro: 'Ваше бронирование отменено.',
  details: [
    ['Автомобиль', carName(event)],
    ['Период', `${formatDate(event.startDate)} — ${formatDate(event.endDate)}`],
    ['Номер брони', String(event.bookingId)],
  ],
});
