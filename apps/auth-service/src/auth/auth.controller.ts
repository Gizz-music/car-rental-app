import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register — регистрация, установка куки и возврат пользователя
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res) {
    const user = await this.authService.register(dto);
    const token = this.authService.createAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    // Устанавливаем HTTP-only cookie с токеном
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return user;
  }

  // POST /auth/login — логин по email/паролю + установка куки
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res) {
    const user = await this.authService.login(dto);
    const token = this.authService.createAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return user;
  }

  // POST /auth/logout — очищаем куку
  @Post('logout')
  async logout(@Res({ passthrough: true }) res) {
    res.clearCookie('access_token');
    return { success: true };
  }

  // GET /auth/current-user — защищённый эндпоинт, возвращает текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Get('current-user')
  me(@Req() req: Request) {
    // JwtStrategy кладёт объект пользователя в req.user
    return req['user'];
  }
}
