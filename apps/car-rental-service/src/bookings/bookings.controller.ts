import { Controller } from '@nestjs/common';
import { carRental } from '@car-rental/contracts';
import { BookingsService } from './bookings.service';

@Controller()
@carRental.BookingsServiceControllerMethods()
export class BookingsController implements carRental.BookingsServiceController {
  constructor(private readonly bookingsService: BookingsService) {}

  createBooking(request: carRental.CreateBookingRequest) {
    return this.bookingsService.create(request);
  }

  listUserBookings(request: carRental.ListUserBookingsRequest) {
    return this.bookingsService.listByUser(request);
  }

  cancelBooking(request: carRental.CancelBookingRequest) {
    return this.bookingsService.cancel(request);
  }
}
