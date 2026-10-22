import {
  Controller,
  Get,
  INestApplication,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Roles } from '../src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { UserRole } from '../src/users/enums/user-role.enum';

// Endpoint de prueba que solo existe en este test, para comprobar
// JwtAuthGuard + RolesGuard tal como los usarán los demás módulos.
@Controller('test-only')
@UseGuards(JwtAuthGuard, RolesGuard)
class CaregiverOnlyController {
  @Get('caregiver')
  @Roles(UserRole.CAREGIVER)
  ok() {
    return { ok: true };
  }
}

interface AuthBody {
  accessToken: string;
  user: { id: string; email: string; role: UserRole };
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  const owner = {
    name: 'María Dueña',
    email: 'maria@pawlie.com',
    password: 'Pawlie123',
    role: UserRole.OWNER,
  };
  const caregiver = {
    name: 'Felipe Cuidador',
    email: 'felipe@pawlie.com',
    password: 'Pawlie123',
    role: UserRole.CAREGIVER,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [CaregiverOnlyController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.runMigrations();
    await dataSource.query('TRUNCATE TABLE "users" CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  const register = (body: object) =>
    request(app.getHttpServer()).post('/auth/register').send(body);
  const login = (email: string, password: string) =>
    request(app.getHttpServer()).post('/auth/login').send({ email, password });

  describe('registro', () => {
    it('crea un dueño y devuelve token sin exponer la contraseña', async () => {
      const res = await register(owner).expect(201);
      const body = res.body as AuthBody;

      expect(body.accessToken).toEqual(expect.any(String));
      expect(body.user).toMatchObject({
        email: owner.email,
        role: UserRole.OWNER,
      });
      expect(body.user).not.toHaveProperty('passwordHash');
    });

    it('crea un cuidador', async () => {
      await register(caregiver).expect(201);
    });

    it('rechaza un correo repetido (409), sin importar mayúsculas', async () => {
      await register({ ...owner, email: 'MARIA@pawlie.com' }).expect(409);
    });

    it('rechaza datos inválidos y campos extra (400)', async () => {
      const res = await register({
        name: '',
        email: 'no-es-correo',
        password: '123',
        role: 'ADMIN',
        isAdmin: true,
      }).expect(400);

      const body = res.body as { message: string[] };
      expect(body.message).toEqual(
        expect.arrayContaining([
          'El correo no es válido',
          'El rol debe ser OWNER o CAREGIVER',
          'property isAdmin should not exist',
        ]),
      );
    });
  });

  describe('login', () => {
    it('devuelve token con credenciales correctas', async () => {
      const res = await login(owner.email, owner.password).expect(200);
      expect((res.body as AuthBody).accessToken).toEqual(expect.any(String));
    });

    it('rechaza contraseña incorrecta (401)', async () => {
      await login(owner.email, 'Incorrecta1').expect(401);
    });
  });

  describe('rutas protegidas', () => {
    it('GET /auth/me devuelve el usuario del token', async () => {
      const { accessToken } = (await login(owner.email, owner.password))
        .body as AuthBody;

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({ email: owner.email, role: 'OWNER' });
    });

    it('sin token responde 401', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('con token falso responde 401', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer token.falso.123')
        .expect(401);
    });

    it('un DUEÑO en un endpoint de CUIDADOR recibe 403', async () => {
      const { accessToken } = (await login(owner.email, owner.password))
        .body as AuthBody;

      await request(app.getHttpServer())
        .get('/test-only/caregiver')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('un CUIDADOR en un endpoint de CUIDADOR recibe 200', async () => {
      const { accessToken } = (await login(caregiver.email, caregiver.password))
        .body as AuthBody;

      await request(app.getHttpServer())
        .get('/test-only/caregiver')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200, { ok: true });
    });
  });
});
