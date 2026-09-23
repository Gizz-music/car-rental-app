import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { notificationsRmqOptions } from '@car-rental/contracts';
import { AppModule } from './app.module';

async function bootstrap() {
  // Сервис только слушает очередь RabbitMQ: ни HTTP, ни gRPC у него нет
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: Transport.RMQ,
        options: {
          ...notificationsRmqOptions(config.getOrThrow<string>('RABBITMQ_URL')),
          // Подтверждаем сообщение вручную, только когда письмо отправлено
          noAck: false,
          prefetchCount: 10,
        },
      }),
    },
  );

  await app.listen();
}
void bootstrap();
