import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SEU_SEGREDO_JWT', // Lembre-se de trocar por uma variável de ambiente!
    });
  }

  /**
   * Validação: O Passport decodifica o JWT e passa o 'payload' para este método.
   * O que este método retorna é injetado no 'request.user'.
   */
  async validate(payload: { sub: string; username: string }) {
    // <-- ALTERADO
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token inválido.');
    }
    // Retorna o objeto 'user' que será anexado ao Request
    return {
      id: payload.sub,
      username: payload.username, // <-- ALTERADO
      role: user.role,
      name: user.name,
    };
  }
}
