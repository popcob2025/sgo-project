import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string; // <-- ALTERADO DE 'email' (e IsEmail)

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole; // <-- Já usa o Enum, mas agora o Enum está correto
}
