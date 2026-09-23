import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { carRental } from '@car-rental/contracts';
import { BookingsService } from '../bookings/bookings.service';
import { parseDateRange, todayRange } from '../common/date-range';
import { invalidArgument } from '../common/rpc-errors';
import { Car } from './entity/car.entity';
import { toCar } from './car.mapper';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car) private readonly carsRepository: Repository<Car>,
    private readonly bookingsService: BookingsService,
  ) {}

  // Отдаём все авто с флагом доступности: скрыть или заблюрить решает клиент
  async list({
    startDate,
    endDate,
  }: carRental.ListCarsRequest): Promise<carRental.ListCarsResponse> {
    if (Boolean(startDate) !== Boolean(endDate)) {
      throw invalidArgument('startDate and endDate must be provided together');
    }
    const range = startDate ? parseDateRange(startDate, endDate) : todayRange();

    const [cars, busyCarIds] = await Promise.all([
      this.carsRepository.find({ order: { pricePerDay: 'ASC' } }),
      this.bookingsService.findBusyCarIds(range),
    ]);

    return {
      cars: cars.map((car) => ({
        car: toCar(car),
        available: !busyCarIds.has(car.id),
      })),
    };
  }
}
