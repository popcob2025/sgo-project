import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Rota protegida.
   * Só pode ser acessada com um Token JWT válido no Header (Bearer Token).
   * Isso cumpre o segundo "A Fazer" do seu relatório.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // 'req.user' é populado pelo JwtStrategy (Passo 4)
    return req.user;
  }
}