import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { carRental } from '@car-rental/contracts';

// Обёртка над gRPC-клиентами car-rental-service
@Injectable()
export class CarRentalClient implements OnModuleInit {
  private carsService: carRental.CarsServiceClient;
  private bookingsService: carRental.BookingsServiceClient;

  constructor(
    @Inject(carRental.CAR_RENTAL_PACKAGE_NAME)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.carsService = this.client.getService<carRental.CarsServiceClient>(
      carRental.CARS_SERVICE_NAME,
    );
    this.bookingsService =
      this.client.getService<carRental.BookingsServiceClient>(
        carRental.BOOKINGS_SERVICE_NAME,
      );
  }

  listCars(request: carRental.ListCarsRequest) {
    return lastValueFrom(this.carsService.listCars(request));
  }

  createBooking(request: carRental.CreateBookingRequest) {
    return lastValueFrom(this.bookingsService.createBooking(request));
  }

  listUserBookings(request: carRental.ListUserBookingsRequest) {
    return lastValueFrom(this.bookingsService.listUserBookings(request));
  }

  cancelBooking(request: carRental.CancelBookingRequest) {
    return lastValueFrom(this.bookingsService.cancelBooking(request));
  }
}
