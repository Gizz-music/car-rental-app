import { IsInt, Min } from 'class-validator';
import { IsIsoDate } from './iso-date';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  carId: number;

  @IsIsoDate()
  startDate: string;

  // День возврата: в этот день авто уже свободно
  @IsIsoDate()
  endDate: string;
}
