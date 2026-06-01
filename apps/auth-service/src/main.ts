import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Подключаем парсер куки, чтобы стратегия JWT могла читать access_token из req.cookies
  app.use(cookieParser());

  // Разрешаем фронтенду на 5173 ходить с куками (credentials: true)
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  // Включаем глобальную валидацию DTO
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
