import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Este Guard invoca automaticamente a lógica do JwtStrategy.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
