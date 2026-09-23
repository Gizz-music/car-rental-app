import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { notificationsRmqOptions } from '@car-rental/contracts';
import { Booking } from './entity/booking.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import {
  BookingEventsPublisher,
  EVENTS_CLIENT,
} from './booking-events.publisher';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    ClientsModule.registerAsync([
      {
        name: EVENTS_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            ...notificationsRmqOptions(
              config.getOrThrow<string>('RABBITMQ_URL'),
            ),
            // Сообщения переживают перезапуск брокера
            persistent: true,
          },
        }),
      },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingEventsPublisher],
  exports: [BookingsService],
})
export class BookingsModule {}
