import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { auth, authGrpcOptions } from '@car-rental/contracts';
import { AuthController } from './auth.controller';
import { AuthClient } from './auth.client';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: auth.AUTH_PACKAGE_NAME,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: authGrpcOptions(config.getOrThrow<string>('AUTH_GRPC_URL')),
        }),
      },
    ]),
    // Gateway только проверяет подпись токена; выпускает токены auth-service
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthClient, JwtAuthGuard],
  // Другие модули защищают свои эндпоинты тем же guard
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
