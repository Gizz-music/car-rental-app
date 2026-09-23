import type { CarBookedEvent } from '@car-rental/contracts';
import type { MailMessage } from '../../mail/mail.service';

const priceFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

// "2026-09-24" -> "24.09.2026"
const formatDate = (isoDate: string) => isoDate.split('-').reverse().join('.');

// Имя пользователя и название авто попадают в HTML — экранируем их
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const carBookedEmail = (
  event: CarBookedEvent,
): Omit<MailMessage, 'to'> => {
  const car = `${event.car.brand} ${event.car.model}`;
  const details: [string, string][] = [
    ['Автомобиль', car],
    ['Дата получения', formatDate(event.startDate)],
    // endDate — день возврата: бронь действует до этого дня
    ['Дата возврата', formatDate(event.endDate)],
    ['Стоимость', priceFormat.format(event.totalPrice)],
    ['Номер брони', String(event.bookingId)],
  ];

  const text = [
    `Здравствуйте, ${event.customer.name}!`,
    '',
    'Ваше бронирование подтверждено.',
    ...details.map(([label, value]) => `${label}: ${value}`),
  ].join('\n');

  const rows = details
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#666">${label}</td><td><b>${escapeHtml(value)}</b></td></tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
      <p>Здравствуйте, ${escapeHtml(event.customer.name)}!</p>
      <p>Ваше бронирование подтверждено.</p>
      <table>${rows}</table>
    </div>`;

  return {
    subject: `Бронирование №${event.bookingId} подтверждено: ${car}`,
    text,
    html,
  };
};
