import type { BadgePropStatus } from "@consta/uikit/Badge";

import type { Booking } from "../model/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Даты приходят как YYYY-MM-DD и парсятся в UTC, поэтому и форматируем в UTC
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

const toIsoDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

export const formatDate = (date: string) =>
  dateFormatter.format(new Date(date));

export const formatPrice = (price: number) => priceFormatter.format(price);

export const countDays = (startDate: string, endDate: string) =>
  Math.round((Date.parse(endDate) - Date.parse(startDate)) / MS_PER_DAY);

interface BookingState {
  label: string;
  status: BadgePropStatus;
}

export const getBookingState = (
  { status, startDate, endDate }: Booking,
  today = toIsoDate(new Date()),
): BookingState => {
  if (status === "cancelled") return { label: "Cancelled", status: "alert" };
  if (endDate <= today) return { label: "Completed", status: "system" };
  if (startDate > today) return { label: "Upcoming", status: "normal" };
  return { label: "In progress", status: "success" };
};
