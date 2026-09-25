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

// Элемент каталога: available — свободно ли авто на выбранный период.
// unavailableUntil — дата YYYY-MM-DD, когда авто снова свободно; пустая, если available.
export interface CarWithAvailability extends Car {
  available: boolean;
  unavailableUntil: string;
}

export interface CarsPage {
  items: CarWithAvailability[];
  total: number;
}

// Даты в формате YYYY-MM-DD; без них доступность считается на сегодня.
// page начинается с 1
export interface CarsQueryParams {
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}
