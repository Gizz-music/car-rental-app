import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import type { auth } from '@car-rental/contracts';
import { AuthClient } from './auth.client';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE_OPTIONS,
} from './access-token.cookie';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authClient: AuthClient) {}

  // POST /auth/register - регистрация, установка cookie и возврат пользователя
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<auth.User | undefined> {
    const { user, accessToken } = await this.authClient.register(dto);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    return user;
  }

  // POST /auth/login - вход по email/паролю + установка cookie
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<auth.User | undefined> {
    const { user, accessToken } = await this.authClient.login(dto);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    return user;
  }

  // POST /auth/logout - очищает cookie
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_COOKIE_OPTIONS);
    return { success: true };
  }

  // GET /auth/current-user - токен проверен в guard, актуальные данные берём из auth-service
  @UseGuards(JwtAuthGuard)
  @Get('current-user')
  async currentUser(
    @Req() req: AuthenticatedRequest,
  ): Promise<auth.User | undefined> {
    const { user } = await this.authClient.getUserById({ id: req.user.sub });
    return user;
  }
}
