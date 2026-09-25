import { Controller, Get, Query } from '@nestjs/common';
import type { carRental } from '@car-rental/contracts';
import { CarRentalClient } from './car-rental.client';
import { ListCarsQuery } from './dto/list-cars.query';

export type CarWithAvailability = carRental.Car & {
  available: boolean;
  unavailableUntil: string;
};

export interface CarsPage {
  items: CarWithAvailability[];
  total: number;
}

@Controller('cars')
export class CarsController {
  constructor(private readonly carRentalClient: CarRentalClient) {}

  // GET /cars?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=1&pageSize=6 - публичный каталог
  @Get()
  async list(
    @Query()
    { startDate = '', endDate = '', page = 0, pageSize = 0 }: ListCarsQuery,
  ): Promise<CarsPage> {
    const { cars, total } = await this.carRentalClient.listCars({
      startDate,
      endDate,
      page,
      pageSize,
    });
    // Плоская модель удобнее клиенту: { ...car, available, unavailableUntil }
    const items = cars.flatMap(({ car, available, unavailableUntil = '' }) =>
      car ? [{ ...car, available, unavailableUntil }] : [],
    );
    return { items, total };
  }
}
