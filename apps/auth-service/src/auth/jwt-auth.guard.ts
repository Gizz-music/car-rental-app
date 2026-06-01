import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// JwtAuthGuard автоматически:
// читает токен из куки,
// валидирует его,
// кладёт пользователя в req.user.
