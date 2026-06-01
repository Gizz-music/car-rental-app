import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users') // Это сделает эндпоинт http://localhost:3000/users
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post('register') // Итоговый путь: http://localhost:3000/users/register
  async register(@Body() createUserDto: any) {
    // Временно используем any, пока не создали DTO
    return this.userService.createUser(createUserDto);
  }
}
