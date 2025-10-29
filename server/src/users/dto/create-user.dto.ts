import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from 'src/common/enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string; // <-- ALTERADO DE 'email' (e IsEmail)

  @IsString()
  @IsNotEmpty()
  passwordHash: string;

  @IsEnum(UserRole)
  role: UserRole;
}
