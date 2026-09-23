import type { carRental } from '@car-rental/contracts';
import { Car } from './entity/car.entity';

export const toCar = (car: Car): carRental.Car => ({
  id: car.id,
  brand: car.brand,
  model: car.model,
  year: car.year,
  transmission: car.transmission,
  fuelType: car.fuelType,
  seats: car.seats,
  pricePerDay: car.pricePerDay,
  imageUrl: car.imageUrl,
});
