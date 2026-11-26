import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { carRental } from '@car-rental/contracts';

const FLEET_QUERY =
  /car|cars|fleet|price|prices|available|availability|catalog|машин|авто|каталог|цена|цен|доступн|tucson|bmw|kia|toyota|honda|mazda|golf|logan/i;

const BOOKING_QUERY =
  /booking|bookings|reserv|cancel|отмен|брон|заказ|profile|профил/i;

@Injectable()
export class RentalToolsService implements OnModuleInit {
  private readonly logger = new Logger(RentalToolsService.name);
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

  wantsFleet(message: string): boolean {
    return FLEET_QUERY.test(message);
  }

  wantsBookings(message: string): boolean {
    return BOOKING_QUERY.test(message);
  }

  async fleetSnapshot(): Promise<string | null> {
    try {
      const { cars } = await lastValueFrom(
        this.carsService.listCars({
          startDate: '',
          endDate: '',
          page: 1,
          pageSize: 20,
        }),
      );

      if (!cars.length) {
        return 'Catalog is empty.';
      }

      const lines = cars.flatMap(({ car, available, unavailableUntil }) => {
        if (!car) {
          return [];
        }

        const status = available
          ? 'available'
          : `unavailable until ${unavailableUntil || 'unknown'}`;
        return [
          `- ${car.brand} ${car.model} (${car.year}), ${car.pricePerDay} per day, ${status}`,
        ];
      });

      return ['Live catalog:', ...lines].join('\n');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`Catalog tool failed: ${message}`);
      return null;
    }
  }

  async bookingsSnapshot(userId: number): Promise<string | null> {
    try {
      const { bookings } = await lastValueFrom(
        this.bookingsService.listUserBookings({ userId }),
      );

      if (!bookings.length) {
        return 'This user has no bookings.';
      }

      const lines = bookings.map((booking) => {
        const car = booking.car
          ? `${booking.car.brand} ${booking.car.model}`
          : 'car';
        return `- #${booking.id} ${car}, ${booking.startDate} → ${booking.endDate}, ${booking.status}, ${booking.totalPrice}`;
      });

      return ['User bookings:', ...lines].join('\n');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`Bookings tool failed: ${message}`);
      return null;
    }
  }
}
