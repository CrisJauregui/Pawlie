import { UserRole } from '../../users/enums/user-role.enum';

// Lo que va dentro del token (firmado, pero NO cifrado: nunca poner datos sensibles).
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

// Lo que queda en request.user después de validar el token.
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
