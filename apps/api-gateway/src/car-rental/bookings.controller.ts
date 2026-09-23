import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { carRental } from '@car-rental/contracts';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../auth/jwt-auth.guard';
import { CarRentalClient } from './car-rental.client';
import { CreateBookingDto } from './dto/create-booking.dto';

// Пользователь берётся только из проверенного JWT, клиент не может подменить userId
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly carRentalClient: CarRentalClient) {}

  // POST /bookings - бронь авто на период [startDate, endDate)
  @Post()
  async create(
    @Body() dto: CreateBookingDto,
    @Req() { user }: AuthenticatedRequest,
  ): Promise<carRental.Booking | undefined> {
    const { booking } = await this.carRentalClient.createBooking({
      ...dto,
      customer: { id: user.sub, email: user.email, name: user.name },
    });
    return booking;
  }

  // GET /bookings - брони текущего пользователя
  @Get()
  async list(
    @Req() { user }: AuthenticatedRequest,
  ): Promise<carRental.Booking[]> {
    const { bookings } = await this.carRentalClient.listUserBookings({
      userId: user.sub,
    });
    return bookings;
  }

  // POST /bookings/:id/cancel - отмена своей брони до даты начала
  @Post(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) bookingId: number,
    @Req() { user }: AuthenticatedRequest,
  ): Promise<carRental.Booking | undefined> {
    const { booking } = await this.carRentalClient.cancelBooking({
      bookingId,
      userId: user.sub,
    });
    return booking;
  }
}
