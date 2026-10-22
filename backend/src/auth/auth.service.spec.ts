import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

// Pruebas unitarias: UsersService y JwtService se reemplazan por mocks,
// así se prueba solo la lógica de AuthService, sin base de datos.
describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<
    Pick<
      UsersService,
      'findByEmail' | 'findByEmailWithPassword' | 'findById' | 'create'
    >
  >;
  let jwtService: { signAsync: jest.Mock };

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    name: 'María',
    email: 'maria@pawlie.com',
    passwordHash: 'hash',
    role: UserRole.OWNER,
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('token-falso') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('register', () => {
    const dto = {
      name: 'María',
      email: 'maria@pawlie.com',
      password: 'Pawlie123',
      role: UserRole.OWNER,
    };

    it('guarda la contraseña con hash y devuelve token + usuario', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation((data) =>
        Promise.resolve(buildUser({ passwordHash: data.passwordHash })),
      );

      const result = await authService.register(dto);

      const savedData = usersService.create.mock.calls[0][0];
      expect(savedData.passwordHash).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, savedData.passwordHash)).toBe(
        true,
      );
      expect(result.accessToken).toBe('token-falso');
      expect(result.user).toEqual({
        id: 'user-1',
        name: 'María',
        email: 'maria@pawlie.com',
        role: UserRole.OWNER,
        phone: null,
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('incluye id, email y rol en el token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(buildUser());

      await authService.register(dto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'maria@pawlie.com',
        role: UserRole.OWNER,
      });
    });

    it('rechaza un correo ya registrado con 409', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(authService.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('devuelve token con credenciales correctas', async () => {
      const passwordHash = await bcrypt.hash('Pawlie123', 4);
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ passwordHash }),
      );

      const result = await authService.login({
        email: 'maria@pawlie.com',
        password: 'Pawlie123',
      });

      expect(result.accessToken).toBe('token-falso');
      expect(result.user.email).toBe('maria@pawlie.com');
    });

    it('rechaza una contraseña incorrecta con 401', async () => {
      const passwordHash = await bcrypt.hash('Pawlie123', 4);
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ passwordHash }),
      );

      await expect(
        authService.login({ email: 'maria@pawlie.com', password: 'otra1234' }),
      ).rejects.toThrow(
        new UnauthorizedException('Correo o contraseña incorrectos'),
      );
    });

    it('rechaza un correo inexistente con el MISMO mensaje', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nadie@pawlie.com', password: 'Pawlie123' }),
      ).rejects.toThrow(
        new UnauthorizedException('Correo o contraseña incorrectos'),
      );
    });
  });
});
