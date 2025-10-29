import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { AuthResponse } from './interfaces/auth-response.interface';

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
    username: string, // <-- ALTERADO
    pass: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findByUsername(username); // <-- ALTERADO
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
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // 1. Validar usuário e senha
    const user = await this.validateUser(
      loginDto.username, // <-- ALTERADO
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    // 2. Criar o Payload do JWT
    const payload = {
      username: user.username, // <-- ALTERADO
      id: user.id,
      role: user.role,
      name: user.name,
    };

    // 3. Retornar o token e os dados do usuário
    return {
      user: payload,
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Chamado pelo AuthController.register
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // 1. Criptografar a senha
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // 2. Criar o usuário no banco
    const user = await this.usersService.create({
      name: registerDto.name,
      username: registerDto.username, // <-- ALTERADO
      role: registerDto.role,
      passwordHash: hashedPassword,
    });

    // 3. Logar o usuário recém-criado (opcional, mas boa UX)
    return this.login({
      username: user.username, // <-- ALTERADO
      password: registerDto.password,
    });
  }
}
