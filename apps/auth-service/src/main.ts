import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { authGrpcOptions } from '@car-rental/contracts';
import { AppModule } from './app.module';

async function bootstrap() {
  // Сервис доступен только по gRPC: HTTP, cookie и CORS живут в api-gateway
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: Transport.GRPC,
        options: authGrpcOptions(config.getOrThrow<string>('GRPC_URL')),
      }),
    },
  );

  await app.listen();
}
void bootstrap();
