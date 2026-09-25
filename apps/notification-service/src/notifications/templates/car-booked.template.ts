import type { CarBookedEvent } from '@car-rental/contracts';
import {
  carName,
  formatDate,
  formatPrice,
  renderBookingEmail,
} from './booking-email';

export const carBookedEmail = (event: CarBookedEvent) =>
  renderBookingEmail(event, {
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
