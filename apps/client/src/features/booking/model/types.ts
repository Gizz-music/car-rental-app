import type { Car } from "@/entities/car/model/types";

export type BookingStatus = "active" | "cancelled";

// Период [startDate, endDate): в день endDate авто уже свободно
export interface Booking {
  id: number;
  car: Car;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
}

export interface CreateBookingRequest {
  carId: number;
  startDate: string;
  endDate: string;
}
