import type { BadgePropStatus } from "@consta/uikit/Badge";

import { toIsoDate } from "@/shared/lib/format";

import type { Booking } from "../model/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const countDays = (startDate: string, endDate: string) =>
  Math.round((Date.parse(endDate) - Date.parse(startDate)) / MS_PER_DAY);

const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return toIsoDate(next);
};

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

// Что произойдёт при отмене — повторяет правила car-rental-service для предпросмотра:
// будущая бронь отменяется, идущая завершается досрочно (сегодня — последний оплачиваемый день)
export type CancellationPlan =
  | { kind: "cancel" }
  | { kind: "endEarly"; endDate: string; totalPrice: number };

export const getCancellationPlan = (
  { status, startDate, endDate, totalPrice }: Booking,
  today = toIsoDate(new Date()),
): CancellationPlan | null => {
  if (status === "cancelled" || endDate <= today) {
    return null;
  }
  if (startDate > today) {
    return { kind: "cancel" };
  }

  const newEndDate = addDays(today, 1);
  if (newEndDate >= endDate) {
    return null;
  }

  const dailyRate = totalPrice / countDays(startDate, endDate);
  return {
    kind: "endEarly",
    endDate: newEndDate,
    totalPrice: Math.round(dailyRate * countDays(startDate, newEndDate)),
  };
};
