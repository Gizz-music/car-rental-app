import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  // Требуем непустое имя
  @IsNotEmpty()
  name: string;

  // Корректный email
  @IsEmail()
  email: string;

  // Минимальная длина пароля
  @MinLength(7)
  password: string;

  @IsOptional()
  @IsArray()
  roles: string[];
}
