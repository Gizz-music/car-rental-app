import type { CarBookedEvent } from '@car-rental/contracts';
import {
  type BookingEmailContent,
  carName,
  formatDate,
  formatPrice,
} from './booking-email';

export const carBookedContent = (
  event: CarBookedEvent,
): BookingEmailContent => ({
  subject: `Бронирование №${event.bookingId} подтверждено: ${carName(event)}`,
  intro: 'Ваше бронирование подтверждено.',
  details: [
    ['Автомобиль', carName(event)],
    ['Дата получения', formatDate(event.startDate)],
    // endDate — день возврата: бронь действует до этого дня
    ['Дата возврата', formatDate(event.endDate)],
    ['Стоимость', formatPrice(event.totalPrice)],
    ['Номер брони', String(event.bookingId)],
  ],
});
