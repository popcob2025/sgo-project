import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'meu-segredo-super-secreto-321',
    });
  }

  /**
   * Validação: O Passport decodifica o JWT e passa o 'payload' para este método.
   * Nós usamos o ID do payload para buscar o usuário no banco.
   * O que este método retorna é injetado no 'request.user'.
   */
  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token inválido ou usuário não encontrado.');
    }
    // Não retornamos a senha hash!
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }
}