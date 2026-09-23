import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import * as bcrypt from 'bcrypt';
import { auth, JwtPayload } from '@car-rental/contracts';
import { UsersService } from '../users/users.service';
import { Users } from '../users/entity/users.entity';

@Injectable()
export class AuthService {
  constructor(
    // Сервис пользователей для работы с БД
    private readonly usersService: UsersService,
    // Сервис JWT для подписи токенов
    private readonly jwtService: JwtService,
  ) {}

  // Регистрация нового пользователя (роли назначаются по умолчанию в БД)
  async register({
    name,
    email,
    password,
  }: auth.RegisterRequest): Promise<auth.RegisterResponse> {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'User with this email already exists',
      });
    }

    // Хэшируем пароль (bcrypt с солью по умолчанию)
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser({
      email,
      name,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  // Вход по email и паролю
  async login({
    email,
    password,
  }: auth.LoginRequest): Promise<auth.LoginResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid credentials',
      });
    }

    return this.buildAuthResponse(user);
  }

  async getUserById({
    id,
  }: auth.GetUserByIdRequest): Promise<auth.GetUserByIdResponse> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });
    }

    return { user: this.toUser(user) };
  }

  // Пользователь + подписанный access-токен (проверяет его api-gateway)
  private buildAuthResponse(user: Users) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };

    return {
      user: this.toUser(user),
      accessToken: this.jwtService.sign(payload),
    };
  }

  // Наружу отдаём только публичные поля, без passwordHash
  private toUser({ id, email, name, roles }: Users): auth.User {
    return { id, email, name, roles };
  }
}
