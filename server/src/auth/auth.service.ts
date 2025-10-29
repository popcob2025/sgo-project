import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida se a senha do DTO bate com a senha hash do banco.
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Chamado pelo AuthController.login
   */
  async login(loginDto: LoginDto) {
    // 1. Validar usuário e senha
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // 2. Criar o Payload do JWT
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    // 3. Assinar o token e retornar
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Chamado pelo AuthController.register
   */
  async register(registerDto: RegisterDto) {
    // 1. Gerar o HASH da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // 2. Criar o usuário no banco
    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      role: registerDto.role,
      passwordHash: hashedPassword,
    });

    // 3. Retornar o usuário (sem a senha)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }
}