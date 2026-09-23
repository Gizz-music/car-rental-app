import { IsOptional } from 'class-validator';
import { IsIsoDate } from './iso-date';

// Без дат доступность считается на сегодня
export class ListCarsQuery {
  @IsOptional()
  @IsIsoDate()
  startDate?: string;

  @IsOptional()
  @IsIsoDate()
  endDate?: string;
}
