import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    // Сервис пользователей для работы с БД
    private readonly usersService: UsersService,
    // Сервис JWT для подписи токенов
    private readonly jwtService: JwtService,
  ) {}

  // Регистрация нового пользователя
  async register(dto: RegisterDto) {
    // Проверяем, что email ещё не занят
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Хэшируем пароль (bcrypt с солью по умолчанию)
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Создаём пользователя в БД
    const user = await this.usersService.createUser({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    // Возвращаем «обрезанный» payload без hash
    return this.buildUserPayload(user.id, user.email, user.name);
  }

  // Логин пользователя
  async login(dto: LoginDto) {
    // Ищем пользователя по email
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Сравниваем пароль с hash
    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Возвращаем безопасный payload
    return this.buildUserPayload(user.id, user.email, user.name);
  }

  // Валидация пользователя по id (используется стратегией JWT)
  async validateUserById(id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.buildUserPayload(user.id, user.email, user.name);
  }

  // Создание access-токена по payload
  createAccessToken(payload: { sub: number; email: string; name: string }) {
    return this.jwtService.sign(payload);
  }

  // Утилита для нормализации объекта пользователя, который возвращаем на клиент
  private buildUserPayload(id: number, email: string, name: string) {
    return { id, email, name };
  }
}
