import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; // 1. Importar UsersModule
import { PassportModule } from '@nestjs/passport'; // 2. Importar Passport
import { JwtModule } from '@nestjs/jwt'; // 3. Importar JWT
import { JwtStrategy } from './jwt.strategy'; // 4. Importar nossa Estratégia
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // 1. Para que o AuthService possa injetar o UsersService
    UsersModule,
    // 2. Para habilitar o Passport
    PassportModule,
    // 3. Para configurar o JWT
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa o ConfigModule para usar o ConfigService
      inject: [ConfigService], // Injeta o ConfigService
      useFactory: (configService: ConfigService) => ({
        // Puxa as configurações do .env
        secret:
          configService.get<string>('JWT_SECRET') ||
          'meu-segredo-super-secreto-321',
        signOptions: { expiresIn: '1h' }, // Token expira em 1 hora
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // 4. Registrar a Estratégia
})
export class AuthModule {}