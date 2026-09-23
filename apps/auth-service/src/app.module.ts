import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule, // эндпоинты /auth/*
    UsersModule, // работа с сущностью пользователя
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Если есть DATABASE_URL (на сервере), используем её.
      // Если нет (локально) — используем наши старые настройки.
      url:
        process.env.DATABASE_URL ||
        'postgres://postgres:postgres@localhost:5432/car_rental_auth',
      autoLoadEntities: true,
      synchronize: true, // На Render это создаст таблицу "users" автоматически при первом запуске

      // ВАЖНО для Render: база требует зашифрованное соединение (SSL)
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
