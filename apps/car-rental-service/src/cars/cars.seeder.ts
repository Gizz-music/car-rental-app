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
    imageUrl: '/cars/kia-rio.jpg',
  },
  {
    brand: 'Hyundai',
    model: 'Solaris',
    year: 2023,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 3000,
    imageUrl: '/cars/hyundai-solaris.jpg',
  },
  {
    brand: 'Volkswagen',
    model: 'Polo',
    year: 2020,
    transmission: 'manual',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 2300,
    imageUrl: '/cars/volkswagen-polo.jpg',
  },
  {
    brand: 'Skoda',
    model: 'Octavia',
    year: 2022,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 3800,
    imageUrl: '/cars/skoda-octavia.jpg',
  },
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    transmission: 'automatic',
    fuelType: 'hybrid',
    seats: 5,
    pricePerDay: 4500,
    imageUrl: '/cars/toyota-camry.jpg',
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    transmission: 'automatic',
    fuelType: 'electric',
    seats: 5,
    pricePerDay: 9000,
    imageUrl: '/cars/tesla-model-3.jpg',
  },
  {
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 5,
    pricePerDay: 12000,
    imageUrl: '/cars/bmw-x5.jpg',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'V-Class',
    year: 2021,
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 7,
    pricePerDay: 11000,
    imageUrl: '/cars/mercedes-v-class.jpg',
  },
];

const imageByModel = new Map(
  SEED_CARS.map((car) => [`${car.brand} ${car.model}`, car.imageUrl ?? '']),
);

// Заполняет пустую таблицу тестовыми авто при старте (для разработки)
@Injectable()
export class CarsSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(CarsSeeder.name);

  constructor(
    @InjectRepository(Car) private readonly carsRepository: Repository<Car>,
  ) {}

  async onApplicationBootstrap() {
    if (await this.carsRepository.count()) {
      await this.backfillImages();
      return;
    }

    await this.carsRepository.save(SEED_CARS);
    this.logger.log(`Seeded ${SEED_CARS.length} cars`);
  }

  // Уже созданные авто могли остаться без фото: колонка image_url появилась раньше сида
  private async backfillImages() {
    const cars = await this.carsRepository.find();
    const pending = cars.filter((car) => !car.imageUrl);

    for (const car of pending) {
      car.imageUrl = imageByModel.get(`${car.brand} ${car.model}`) ?? '';
    }

    const withImages = pending.filter((car) => car.imageUrl);
    if (!withImages.length) {
      return;
    }

    await this.carsRepository.save(withImages);
    this.logger.log(`Added photos for ${withImages.length} cars`);
  }
}
