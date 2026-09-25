export const CAR_BOOKED_EVENT = 'car.booked';
export const BOOKING_CANCELLED_EVENT = 'booking.cancelled';

// Carries everything the Notification service needs, so it never has to
// call other services synchronously.
export interface BookingEventDetails {
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

export type CarBookedEvent = BookingEventDetails;

export interface BookingCancelledEvent extends BookingEventDetails {
  // true: the rental was in progress and ended early,
  // endDate and totalPrice are already recalculated.
  endedEarly: boolean;
}
