import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { carRental, carRentalGrpcOptions } from '@car-rental/contracts';
import { AuthModule } from '../auth/auth.module';
import { CarRentalClient } from './car-rental.client';
import { CarsController } from './cars.controller';
import { BookingsController } from './bookings.controller';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: carRental.CAR_RENTAL_PACKAGE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: carRentalGrpcOptions(
            config.getOrThrow<string>('CAR_RENTAL_GRPC_URL'),
          ),
        }),
      },
    ]),
  ],
  controllers: [CarsController, BookingsController],
  providers: [CarRentalClient],
})
export class CarRentalModule {}
