import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { IsIsoDate } from './iso-date';

const MAX_PAGE_SIZE = 50;

// Без дат авто недоступно, пока есть активная бронь. С датами — только на этот период.
export class ListCarsQuery {
  @IsOptional()
  @IsIsoDate()
  startDate?: string;

  @IsOptional()
  @IsIsoDate()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize?: number;
}
