export type Transmission = "automatic" | "manual";

export type FuelType = "petrol" | "diesel" | "hybrid" | "electric";

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  pricePerDay: number;
  imageUrl: string;
}

// Элемент каталога: available — свободно ли авто на выбранный период
export interface CarWithAvailability extends Car {
  available: boolean;
}

// Даты в формате YYYY-MM-DD; без них доступность считается на сегодня
export interface CarsQueryParams {
  startDate: string;
  endDate: string;
}
