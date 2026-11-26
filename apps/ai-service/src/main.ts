import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { assistantGrpcOptions } from '@car-rental/contracts';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: Transport.GRPC,
        options: assistantGrpcOptions(config.getOrThrow<string>('GRPC_URL')),
      }),
    },
  );

  await app.listen();
}
void bootstrap();
