import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/enums/user-role.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  const buildContext = (user?: { role: UserRole }): ExecutionContext =>
    ({
      getHandler: () => () => undefined,
      getClass: () => class {},
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  const requireRoles = (roles: UserRole[] | undefined) =>
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);

  afterEach(() => jest.restoreAllMocks());

  it('deja pasar si el endpoint no tiene @Roles', () => {
    requireRoles(undefined);
    expect(guard.canActivate(buildContext({ role: UserRole.OWNER }))).toBe(
      true,
    );
  });

  it('deja pasar si el usuario tiene el rol requerido', () => {
    requireRoles([UserRole.CAREGIVER]);
    expect(guard.canActivate(buildContext({ role: UserRole.CAREGIVER }))).toBe(
      true,
    );
  });

  it('responde 403 si el usuario NO tiene el rol requerido', () => {
    requireRoles([UserRole.CAREGIVER]);
    expect(() =>
      guard.canActivate(buildContext({ role: UserRole.OWNER })),
    ).toThrow(ForbiddenException);
  });

  it('responde 403 si no hay usuario en la petición', () => {
    requireRoles([UserRole.OWNER]);
    expect(() => guard.canActivate(buildContext(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
