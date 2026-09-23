import type { carRental } from '@car-rental/contracts';
import { toCar } from '../cars/car.mapper';
import { Booking } from './entity/booking.entity';

export const toBooking = (booking: Booking): carRental.Booking => ({
  id: booking.id,
  car: toCar(booking.car),
  startDate: booking.startDate,
  endDate: booking.endDate,
  status: booking.status,
  totalPrice: booking.totalPrice,
  createdAt: booking.createdAt.toISOString(),
});
