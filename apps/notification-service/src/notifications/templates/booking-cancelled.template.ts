import type { BookingCancelledEvent } from '@car-rental/contracts';
import {
  type BookingEmailContent,
  carName,
  formatDate,
  formatPrice,
} from './booking-email';

const endedEarlyContent = (
  event: BookingCancelledEvent,
): BookingEmailContent => ({
  subject: `Аренда №${event.bookingId} завершена досрочно: ${carName(event)}`,
  intro: 'Аренда завершена досрочно, стоимость пересчитана.',
  details: [
    ['Автомобиль', carName(event)],
    ['Дата получения', formatDate(event.startDate)],
    ['Новая дата возврата', formatDate(event.endDate)],
    ['Итоговая стоимость', formatPrice(event.totalPrice)],
    ['Номер брони', String(event.bookingId)],
  ],
});

const cancelledContent = (
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

export const bookingCancelledContent = (
  event: BookingCancelledEvent,
): BookingEmailContent =>
  event.endedEarly ? endedEarlyContent(event) : cancelledContent(event);
