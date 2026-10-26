import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request as ExpressRequest } from 'express';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { Request as ServiceRequest } from '../requests/request.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { ServiceUpdate } from './service-update.entity';
import { UpdatesController } from './updates.controller';
import { UpdatesService } from './updates.service';

// Sustituye la validación del JWT: lee el usuario de un header de prueba.
class FakeJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<ExpressRequest>();
    const raw = req.headers['x-test-user'];
    if (typeof raw !== 'string') {
      throw new UnauthorizedException();
    }
    req.user = JSON.parse(raw) as AuthUser;
    return true;
  }
}

const REQ_ID = '9886934a-e2dc-4917-b9b9-18aae96250e0';
const asUser = (role: UserRole) =>
  JSON.stringify({ id: 'user-1', email: 'u@test.com', role });

describe('Seguimiento del servicio (integración)', () => {
  let app: INestApplication;
  const updatesRepo = { create: jest.fn(), save: jest.fn() };
  const requestsRepo = { findOne: jest.fn(), update: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UpdatesController],
      providers: [
        UpdatesService,
        { provide: getRepositoryToken(ServiceUpdate), useValue: updatesRepo },
        { provide: getRepositoryToken(ServiceRequest), useValue: requestsRepo },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(FakeJwtGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    updatesRepo.create.mockImplementation((data: object) => data);
    updatesRepo.save.mockImplementation((data: object) =>
      Promise.resolve(data),
    );
  });

  const requestInStatus = (status: RequestStatus) =>
    requestsRepo.findOne.mockResolvedValue({ id: REQ_ID, status });

  it('responde 401 sin usuario autenticado', async () => {
    await request(app.getHttpServer())
      .patch(`/requests/${REQ_ID}/start`)
      .expect(401);
  });

  it('responde 403 si un dueño intenta iniciar el servicio', async () => {
    await request(app.getHttpServer())
      .patch(`/requests/${REQ_ID}/start`)
      .set('x-test-user', asUser(UserRole.OWNER))
      .expect(403);
    expect(requestsRepo.findOne).not.toHaveBeenCalled();
  });

  it('responde 400 si el id no es un UUID', async () => {
    await request(app.getHttpServer())
      .patch('/requests/no-es-uuid/start')
      .set('x-test-user', asUser(UserRole.CAREGIVER))
      .expect(400);
  });

  it('inicia un servicio ACEPTADA y lo deja EN_CURSO', async () => {
    requestInStatus(RequestStatus.ACEPTADA);
    requestsRepo.update.mockResolvedValue({ affected: 1 });

    await request(app.getHttpServer())
      .patch(`/requests/${REQ_ID}/start`)
      .set('x-test-user', asUser(UserRole.CAREGIVER))
      .expect(200);

    expect(requestsRepo.update).toHaveBeenCalledWith(
      { id: REQ_ID, status: RequestStatus.ACEPTADA },
      { status: RequestStatus.EN_CURSO },
    );
  });

  it('responde 409 al iniciar un servicio que ya está EN_CURSO', async () => {
    requestInStatus(RequestStatus.EN_CURSO);

    await request(app.getHttpServer())
      .patch(`/requests/${REQ_ID}/start`)
      .set('x-test-user', asUser(UserRole.CAREGIVER))
      .expect(409);
  });

  it('responde 400 al publicar una actualización sin mensaje', async () => {
    await request(app.getHttpServer())
      .post(`/requests/${REQ_ID}/updates`)
      .set('x-test-user', asUser(UserRole.CAREGIVER))
      .send({})
      .expect(400);
  });

  it('publica una actualización con el servicio EN_CURSO', async () => {
    requestInStatus(RequestStatus.EN_CURSO);

    await request(app.getHttpServer())
      .post(`/requests/${REQ_ID}/updates`)
      .set('x-test-user', asUser(UserRole.CAREGIVER))
      .send({ message: 'Paseo iniciado' })
      .expect(201);

    expect(updatesRepo.save).toHaveBeenCalled();
  });

  it('finaliza un servicio EN_CURSO', async () => {
    requestInStatus(RequestStatus.EN_CURSO);
    requestsRepo.update.mockResolvedValue({ affected: 1 });

    await request(app.getHttpServer())
      .patch(`/requests/${REQ_ID}/complete`)
      .set('x-test-user', asUser(UserRole.CAREGIVER))
      .expect(200);
  });
});
