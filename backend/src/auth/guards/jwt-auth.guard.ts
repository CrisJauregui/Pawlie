import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Protege una ruta: sin token válido responde 401 Unauthorized.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
