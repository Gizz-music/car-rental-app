import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { carRental } from '@car-rental/contracts';
import { BookingsService } from '../bookings/bookings.service';
import { parseDateRange, todayRange } from '../common/date-range';
import { invalidArgument } from '../common/rpc-errors';
import { Car } from './entity/car.entity';
import { toCar } from './car.mapper';

const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 50;

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car) private readonly carsRepository: Repository<Car>,
    private readonly bookingsService: BookingsService,
  ) {}

  // Отдаём страницу авто с флагом доступности: скрыть или заблюрить решает клиент
  async list({
    startDate,
    endDate,
    page = 0,
    pageSize = 0,
  }: carRental.ListCarsRequest): Promise<carRental.ListCarsResponse> {
    if (Boolean(startDate) !== Boolean(endDate)) {
      throw invalidArgument('startDate and endDate must be provided together');
    }
    if (page < 0 || pageSize < 0 || pageSize > MAX_PAGE_SIZE) {
      throw invalidArgument(
        `page must be >= 1, pageSize must be between 1 and ${MAX_PAGE_SIZE}`,
      );
    }
    const range = startDate ? parseDateRange(startDate, endDate) : todayRange();
    const take = pageSize || DEFAULT_PAGE_SIZE;
    const skip = (Math.max(page, 1) - 1) * take;

    const [cars, total] = await this.carsRepository.findAndCount({
      order: { pricePerDay: 'ASC', id: 'ASC' },
      skip,
      take,
    });
    const unavailableUntilByCarId =
      await this.bookingsService.findUnavailableUntil(
        cars.map(({ id }) => id),
        range,
      );

    return {
      cars: cars.map((car) => ({
        car: toCar(car),
        available: !unavailableUntilByCarId.has(car.id),
        unavailableUntil: unavailableUntilByCarId.get(car.id) ?? '',
      })),
      total,
    };
  }
}
