import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Car } from './entity/car.entity';

const SEED_CARS: DeepPartial<Car>[] = [
  {
    brand: 'Renault',
    model: 'Logan',
    year: 2020,
    transmission: 'manual',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 2200,
    imageUrl: '/cars/renault-logan.jpg',
  },
  {
    brand: 'Mazda',
    model: '3',
    year: 2020,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 3100,
    imageUrl: '/cars/mazda-3.jpg',
  },
  {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2019,
    transmission: 'automatic',
    fuelType: 'hybrid',
    seats: 5,
    pricePerDay: 3200,
    imageUrl: '/cars/toyota-corolla.jpg',
  },
  {
    brand: 'Honda',
    model: 'Civic',
    year: 2022,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 3400,
    imageUrl: '/cars/honda-civic.jpg',
  },
  {
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2021,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 3900,
    imageUrl: '/cars/volkswagen-golf.jpg',
  },
  {
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2021,
    transmission: 'automatic',
    fuelType: 'hybrid',
    seats: 5,
    pricePerDay: 4900,
    imageUrl: '/cars/hyundai-tucson.jpg',
  },
  {
    brand: 'Kia',
    model: 'Sportage',
    year: 2022,
    transmission: 'automatic',
    fuelType: 'hybrid',
    seats: 5,
    pricePerDay: 5100,
    imageUrl: '/cars/kia-sportage.jpg',
  },
  {
    brand: 'BMW',
    model: '3 Series',
    year: 2016,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 5200,
    imageUrl: '/cars/bmw-3-series.jpg',
  },
  {
    brand: 'Toyota',
    model: 'RAV4',
    year: 2021,
    transmission: 'automatic',
    fuelType: 'hybrid',
    seats: 5,
    pricePerDay: 5600,
    imageUrl: '/cars/toyota-rav4.jpg',
  },
  {
    brand: 'Audi',
    model: 'A4',
    year: 2019,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 5800,
    imageUrl: '/cars/audi-a4.jpg',
  },
  {
    brand: 'Volvo',
    model: 'XC60',
    year: 2018,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 6400,
    imageUrl: '/cars/volvo-xc60.jpg',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2022,
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: 7200,
    imageUrl: '/cars/mercedes-c-class.jpg',
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
