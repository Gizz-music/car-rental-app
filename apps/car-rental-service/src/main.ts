import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { carRentalGrpcOptions } from '@car-rental/contracts';
import { AppModule } from './app.module';

async function bootstrap() {
  // Сервис доступен только по gRPC из api-gateway
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: Transport.GRPC,
        options: carRentalGrpcOptions(config.getOrThrow<string>('GRPC_URL')),
      }),
    },
  );

  await app.listen();
}
void bootstrap();
