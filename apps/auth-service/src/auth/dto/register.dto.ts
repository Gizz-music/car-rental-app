import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  // Требуем непустое имя
  @IsNotEmpty()
  name: string;

  // Корректный email
  @IsEmail()
  email: string;

  // Минимальная длина пароля
  @MinLength(6)
  password: string;
}
