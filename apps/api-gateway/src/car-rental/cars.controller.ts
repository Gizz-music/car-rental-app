import { Controller, Get, Query } from '@nestjs/common';
import type { carRental } from '@car-rental/contracts';
import { CarRentalClient } from './car-rental.client';
import { ListCarsQuery } from './dto/list-cars.query';

export type CarWithAvailability = carRental.Car & { available: boolean };

@Controller('cars')
export class CarsController {
  constructor(private readonly carRentalClient: CarRentalClient) {}

  // GET /cars?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD - публичный каталог
  @Get()
  async list(
    @Query() { startDate = '', endDate = '' }: ListCarsQuery,
  ): Promise<CarWithAvailability[]> {
    const { cars } = await this.carRentalClient.listCars({
      startDate,
      endDate,
    });
    // Плоская модель удобнее клиенту: { ...car, available }
    return cars.flatMap(({ car, available }) =>
      car ? [{ ...car, available }] : [],
    );
  }
}
