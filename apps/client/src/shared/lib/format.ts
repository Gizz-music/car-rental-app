const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

// Даты приходят как YYYY-MM-DD и парсятся в UTC, поэтому и форматируем в UTC
export const formatDate = (date: string) =>
  dateFormatter.format(new Date(date));

export const formatPrice = (price: number) => priceFormatter.format(price);

export const formatLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const toIsoDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
