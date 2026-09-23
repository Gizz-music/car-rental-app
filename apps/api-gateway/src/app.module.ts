import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CarRentalModule } from './car-rental/car-rental.module';
import { GrpcExceptionFilter } from './common/grpc-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CarRentalModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: GrpcExceptionFilter }],
})
export class AppModule {}
