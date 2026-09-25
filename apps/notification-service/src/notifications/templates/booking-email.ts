import type { BookingEventDetails } from '@car-rental/contracts';
import type { MailMessage } from '../../mail/mail.service';

const priceFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

// "2026-09-24" -> "24.09.2026"
export const formatDate = (isoDate: string) =>
  isoDate.split('-').reverse().join('.');

export const formatPrice = (price: number) => priceFormat.format(price);

export const carName = ({ car }: BookingEventDetails) =>
  `${car.brand} ${car.model}`;

// Имя пользователя и название авто попадают в HTML — экранируем их
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

interface BookingEmailContent {
  subject: string;
  intro: string;
  details: [label: string, value: string][];
}

// Общая вёрстка писем о брони: приветствие, одна строка текста и таблица деталей
export const renderBookingEmail = (
  event: BookingEventDetails,
  { subject, intro, details }: BookingEmailContent,
): Omit<MailMessage, 'to'> => {
  const text = [
    `Здравствуйте, ${event.customer.name}!`,
    '',
    intro,
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
      <p>${intro}</p>
      <table>${rows}</table>
    </div>`;

  return { subject, text, html };
};
