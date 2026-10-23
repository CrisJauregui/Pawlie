import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AuthUser, JwtPayload } from '../interfaces/jwt-payload.interface';

// Passport ejecuta esta estrategia cada vez que se usa JwtAuthGuard:
// 1. Lee el token del header "Authorization: Bearer <token>"
// 2. Verifica la firma y la expiración con JWT_SECRET (si falla → 401)
// 3. Llama a validate() con el contenido del token
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Lo que retorna este método queda disponible como request.user.
  async validate(payload: JwtPayload): Promise<AuthUser> {
    // Se confirma que el usuario todavía existe (pudo ser eliminado después de emitir el token).
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Sesión no válida');
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
