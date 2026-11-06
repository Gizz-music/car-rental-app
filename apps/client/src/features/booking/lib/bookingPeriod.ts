import type { BadgePropStatus } from "@consta/uikit/Badge";

import { toIsoDate } from "@/shared/lib/format";

import type { Booking } from "../model/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

// Отменить можно любую бронь, которая ещё не закончилась и не отменена.
export const canCancelBooking = (
  { status, endDate }: Booking,
  today = toIsoDate(new Date()),
) => status !== "cancelled" && endDate > today;

// Завершённая или отменённая аренда уже не занимает авто: её можно убрать из истории
export const canDeleteBooking = (
  { status, endDate }: Booking,
  today = toIsoDate(new Date()),
) => status === "cancelled" || endDate <= today;
