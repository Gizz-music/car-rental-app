import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Car } from './entity/car.entity';

const SEED_CARS: DeepPartial<Car>[] = [
  {
    brand: 'Kia',
    model: 'Rio',
    year: 2021,
    transmission: 'manual',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 2500,
  },
  {
    brand: 'Hyundai',
    model: 'Solaris',
    year: 2023,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 3000,
  },
  {
    brand: 'Volkswagen',
    model: 'Polo',
    year: 2020,
    transmission: 'manual',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 2300,
  },
  {
    brand: 'Skoda',
    model: 'Octavia',
    year: 2022,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 3800,
  },
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    transmission: 'automatic',
    fuelType: 'hybrid',
    seats: 5,
    pricePerDay: 4500,
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    transmission: 'automatic',
    fuelType: 'electric',
    seats: 5,
    pricePerDay: 9000,
  },
  {
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 5,
    pricePerDay: 12000,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'V-Class',
    year: 2021,
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 7,
    pricePerDay: 11000,
  },
];

// Заполняет пустую таблицу тестовыми авто при старте (для разработки)
@Injectable()
export class CarsSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(CarsSeeder.name);

  constructor(
    @InjectRepository(Car) private readonly carsRepository: Repository<Car>,
  ) {}

  async onApplicationBootstrap() {
    if (await this.carsRepository.count()) {
      return;
    }

    await this.carsRepository.save(SEED_CARS);
    this.logger.log(`Seeded ${SEED_CARS.length} cars`);
  }
}
