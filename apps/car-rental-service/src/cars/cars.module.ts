import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from '../bookings/bookings.module';
import { Car } from './entity/car.entity';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { CarsSeeder } from './cars.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Car]), BookingsModule],
  controllers: [CarsController],
  providers: [CarsService, CarsSeeder],
})
export class CarsModule {}
