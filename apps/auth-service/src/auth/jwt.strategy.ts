import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      // Забираем токен из HTTP-only cookie access_token
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.['access_token'],
      ]),
      ignoreExpiration: false,
      // Для простоты: секрет из env либо дефолтный (в проде — только из env)
      secretOrKey: process.env.JWT_SECRET || 'dev_secret_key',
    });
  }

  // Payload -> пользователь (используем AuthService для доп. проверки)
  async validate(payload: { sub: number; email: string; name: string }) {
    return this.authService.validateUserById(payload.sub);
  }
}
