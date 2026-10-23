import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from '../../users/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../interfaces/jwt-payload.interface';

// Debe usarse DESPUÉS de JwtAuthGuard: @UseGuards(JwtAuthGuard, RolesGuard)
// Compara el rol del usuario (que viene del token) con los roles de @Roles().
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Se busca @Roles() primero en el método y luego en el controller.
    const requiredRoles = this.reflector.getAllAndOverride<
      UserRole[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // Sin @Roles() basta con estar autenticado.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = context.switchToHttp().getRequest<Request>().user as
      AuthUser | undefined;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta acción',
      );
    }
    return true;
  }
}
