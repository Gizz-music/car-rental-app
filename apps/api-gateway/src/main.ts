import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Разбор cookie, чтобы JwtAuthGuard мог прочитать access_token из req.cookies
  app.use(cookieParser());

  // Фронтенду разрешено ходить с cookie (credentials: true)
  app.enableCors({
    origin: config.getOrThrow<string>('CORS_ORIGIN').split(','),
    credentials: true,
  });

  // whitelist отбрасывает поля, которых нет в DTO (например, roles).
  // transform отдаёт в контроллер DTO с приведёнными типами (page из query — число, а не строка)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(config.get<number>('PORT', 3000));
}
void bootstrap();
