import { invalidArgument } from './rpc-errors';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

// Полуоткрытый интервал [start, end): в день end авто уже свободно
export interface DateRange {
  start: string;
  end: string;
  days: number;
}

const toIsoDate = (time: number) => new Date(time).toISOString().slice(0, 10);

const toTime = (date: string): number => {
  const time = Date.parse(`${date}T00:00:00Z`);
  // Сверка с исходной строкой отсекает несуществующие даты вроде 2026-02-30
  if (!ISO_DATE.test(date) || Number.isNaN(time) || toIsoDate(time) !== date) {
    throw invalidArgument(`Invalid date "${date}", expected YYYY-MM-DD`);
  }
  return time;
};

export const today = (): string => toIsoDate(Date.now());

export const parseDateRange = (start: string, end: string): DateRange => {
  const startTime = toTime(start);
  const endTime = toTime(end);

  if (start < today()) {
    throw invalidArgument('Start date cannot be in the past');
  }
  if (endTime <= startTime) {
    throw invalidArgument('End date must be after start date');
  }

  return { start, end, days: (endTime - startTime) / DAY_MS };
};

// Период «на сегодня»: используется, когда клиент не выбрал даты
export const todayRange = (): DateRange => {
  const start = today();
  return { start, end: toIsoDate(toTime(start) + DAY_MS), days: 1 };
};
