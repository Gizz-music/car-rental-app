import type { BookingCancelledEvent } from '@car-rental/contracts';
import {
  carName,
  formatDate,
  formatPrice,
  renderBookingEmail,
} from './booking-email';

const endedEarlyEmail = (event: BookingCancelledEvent) =>
  renderBookingEmail(event, {
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

const cancelledEmail = (event: BookingCancelledEvent) =>
  renderBookingEmail(event, {
    subject: `Бронирование №${event.bookingId} отменено: ${carName(event)}`,
    intro: 'Ваше бронирование отменено.',
    details: [
      ['Автомобиль', carName(event)],
      [
        'Период',
        `${formatDate(event.startDate)} — ${formatDate(event.endDate)}`,
      ],
      ['Номер брони', String(event.bookingId)],
    ],
  });

export const bookingCancelledEmail = (event: BookingCancelledEvent) =>
  event.endedEarly ? endedEarlyEmail(event) : cancelledEmail(event);
