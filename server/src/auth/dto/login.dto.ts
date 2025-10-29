import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string; // <-- ALTERADO DE 'email' (e IsEmail)

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
