import { Matches } from 'class-validator';

// Формат проверяем на входе; бизнес-правила (не в прошлом, end > start) — в car-rental-service
export const IsIsoDate = () =>
  Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '$property must be YYYY-MM-DD' });
