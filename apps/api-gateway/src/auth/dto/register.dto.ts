import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import type { auth } from '@car-rental/contracts';

export class RegisterDto implements auth.RegisterRequest {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(7)
  password: string;
}
