import { IsEmail, IsNotEmpty } from 'class-validator';
import type { auth } from '@car-rental/contracts';

export class LoginDto implements auth.LoginRequest {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
