import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

export const ROLES_KEY = 'roles';

// Uso: @Roles(UserRole.CAREGIVER) sobre un endpoint o un controller.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
