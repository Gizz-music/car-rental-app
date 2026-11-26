import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChatDto {
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  message!: string;
}
