export const CAR_BOOKED_EVENT = 'car.booked';

// Carries everything the Notification service needs, so it never has to
// call other services synchronously.
export interface CarBookedEvent {
  bookingId: number;
  car: {
    id: number;
    brand: string;
    model: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  customer: {
    id: number;
    email: string;
    name: string;
  };
}
