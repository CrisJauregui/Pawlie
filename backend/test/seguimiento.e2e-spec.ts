import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { CaregiverProfile } from '../src/caregivers/caregiver-profile.entity';
import { RequestStatus } from '../src/requests/enums/request-status.enum';
import { Request as ServiceRequest } from '../src/requests/request.entity';
import { ServiceType } from '../src/services/enums/service-type.enum';
import { Service } from '../src/services/service.entity';
import { UserRole } from '../src/users/enums/user-role.enum';

// Prueba de punta a punta del seguimiento del servicio y las reseñas:
// se levanta la API completa contra la base de datos de pruebas y se
// hacen las mismas peticiones que hace el frontend.
describe('Seguimiento y reseñas (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  // Tokens de cada usuario de la prueba.
  let tokenDuena: string;
  let tokenOtraDuena: string;
  let tokenCuidadora: string;
  let tokenOtroCuidador: string;

  // Solicitudes creadas para la prueba.
  let solicitudEnCurso: string;
  let solicitudFinalizada: string;

  const PASSWORD = 'Pawlie123';
  const http = () => request(app.getHttpServer());

  async function registrar(
    name: string,
    email: string,
    role: UserRole,
  ): Promise<{ token: string; id: string }> {
    const res = await http()
      .post('/auth/register')
      .send({ name, email, password: PASSWORD, role })
      .expect(201);
    const body = res.body as { accessToken: string; user: { id: string } };
    return { token: body.accessToken, id: body.user.id };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
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

    dataSource = app.get(DataSource);
    await dataSource.runMigrations();
    await dataSource.query('TRUNCATE TABLE "users" CASCADE');

    // Usuarios
    const duena = await registrar(
      'María Dueña',
      'maria@test.com',
      UserRole.OWNER,
    );
    const otraDuena = await registrar(
      'Laura Dueña',
      'laura@test.com',
      UserRole.OWNER,
    );
    const cuidadora = await registrar(
      'Camila Cuidadora',
      'camila@test.com',
      UserRole.CAREGIVER,
    );
    const otroCuidador = await registrar(
      'Andrés Cuidador',
      'andres@test.com',
      UserRole.CAREGIVER,
    );
    tokenDuena = duena.token;
    tokenOtraDuena = otraDuena.token;
    tokenCuidadora = cuidadora.token;
    tokenOtroCuidador = otroCuidador.token;

    // Mascota de la dueña (con el endpoint de mascotas).
    const mascota = await http()
      .post('/pets')
      .set('Authorization', `Bearer ${tokenDuena}`)
      .send({
        name: 'Max',
        species: 'Perro',
        breed: 'Golden Retriever',
        age: 3,
      })
      .expect(201);
    const petId = (mascota.body as { id: string }).id;

    // Perfil y servicio de la cuidadora (todavía no hay endpoint, se crean directo).
    const perfil = await dataSource.getRepository(CaregiverProfile).save({
      user: { id: cuidadora.id },
      city: 'San Fernando, Cali',
    });
    const servicio = await dataSource.getRepository(Service).save({
      caregiver: perfil,
      name: 'Paseo de 1 hora',
      type: ServiceType.PASEO,
      price: '35000',
      durationMinutes: 60,
    });

    // Dos solicitudes de la dueña con la cuidadora.
    const solicitudes = dataSource.getRepository(ServiceRequest);
    const base = {
      owner: { id: duena.id },
      caregiver: perfil,
      pet: { id: petId },
      service: servicio,
      startAt: new Date(),
      endAt: new Date(Date.now() + 60 * 60 * 1000),
      totalPrice: '35000',
    };
    solicitudEnCurso = (
      await solicitudes.save({ ...base, status: RequestStatus.ACEPTADA })
    ).id;
    solicitudFinalizada = (
      await solicitudes.save({ ...base, status: RequestStatus.FINALIZADA })
    ).id;

    // La cuidadora inicia el servicio y publica una actualización (módulo de actualizaciones).
    await http()
      .patch(`/requests/${solicitudEnCurso}/start`)
      .set('Authorization', `Bearer ${tokenCuidadora}`)
      .expect(200);
    await http()
      .post(`/requests/${solicitudEnCurso}/updates`)
      .set('Authorization', `Bearer ${tokenCuidadora}`)
      .send({ message: 'Salimos hacia el Parque del Perro' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /owner/summary', () => {
    it('devuelve los contadores y las solicitudes de la dueña', async () => {
      const res = await http()
        .get('/owner/summary')
        .set('Authorization', `Bearer ${tokenDuena}`)
        .expect(200);

      expect(res.body).toMatchObject({
        pets: 1,
        activeRequests: 1,
        completedServices: 1,
      });
      expect((res.body as { requests: unknown[] }).requests).toHaveLength(2);
    });

    it('un cuidador no puede consultarlo (403)', async () => {
      await http()
        .get('/owner/summary')
        .set('Authorization', `Bearer ${tokenCuidadora}`)
        .expect(403);
    });

    it('sin token responde 401', async () => {
      await http().get('/owner/summary').expect(401);
    });
  });

  describe('GET /requests/:id/tracking', () => {
    it('la dueña ve el seguimiento con la actualización de la cuidadora', async () => {
      const res = await http()
        .get(`/requests/${solicitudEnCurso}/tracking`)
        .set('Authorization', `Bearer ${tokenDuena}`)
        .expect(200);

      expect(res.body).toMatchObject({
        status: RequestStatus.EN_CURSO,
        totalPrice: 35000,
        pet: { name: 'Max' },
        caregiver: { name: 'Camila Cuidadora' },
        review: null,
      });
      expect(res.body).toHaveProperty(
        'updates.0.message',
        'Salimos hacia el Parque del Perro',
      );
    });

    it('la cuidadora de la solicitud también lo ve', async () => {
      await http()
        .get(`/requests/${solicitudEnCurso}/tracking`)
        .set('Authorization', `Bearer ${tokenCuidadora}`)
        .expect(200);
    });

    it('otra dueña recibe 404 (no se revela que la solicitud existe)', async () => {
      await http()
        .get(`/requests/${solicitudEnCurso}/tracking`)
        .set('Authorization', `Bearer ${tokenOtraDuena}`)
        .expect(404);
    });

    it('otro cuidador recibe 404', async () => {
      await http()
        .get(`/requests/${solicitudEnCurso}/tracking`)
        .set('Authorization', `Bearer ${tokenOtroCuidador}`)
        .expect(404);
    });

    it('un id que no es UUID responde 400', async () => {
      await http()
        .get('/requests/abc/tracking')
        .set('Authorization', `Bearer ${tokenDuena}`)
        .expect(400);
    });
  });

  describe('POST /requests/:id/review', () => {
    const calificar = (id: string, token: string, body: object) =>
      http()
        .post(`/requests/${id}/review`)
        .set('Authorization', `Bearer ${token}`)
        .send(body);

    it('rechaza calificar un servicio que no ha terminado (409)', async () => {
      await calificar(solicitudEnCurso, tokenDuena, { rating: 5 }).expect(409);
    });

    it('rechaza datos inválidos (400)', async () => {
      const res = await calificar(solicitudFinalizada, tokenDuena, {
        rating: 7,
        tags: ['Etiqueta rara'],
      }).expect(400);

      expect((res.body as { message: string[] }).message).toEqual(
        expect.arrayContaining([
          'La calificación máxima es 5 estrellas',
          'Etiqueta no válida',
        ]),
      );
    });

    it('un cuidador no puede calificar (403)', async () => {
      await calificar(solicitudFinalizada, tokenCuidadora, {
        rating: 5,
      }).expect(403);
    });

    it('otra dueña no puede calificar una solicitud ajena (404)', async () => {
      await calificar(solicitudFinalizada, tokenOtraDuena, {
        rating: 5,
      }).expect(404);
    });

    it('la dueña califica el servicio finalizado (201)', async () => {
      const res = await calificar(solicitudFinalizada, tokenDuena, {
        rating: 5,
        comment: 'Max volvió feliz',
        tags: ['Muy puntual', 'Regresó feliz'],
      }).expect(201);

      expect(res.body).toMatchObject({
        rating: 5,
        comment: 'Max volvió feliz',
        tags: ['Muy puntual', 'Regresó feliz'],
      });
    });

    it('no permite calificar dos veces (409)', async () => {
      await calificar(solicitudFinalizada, tokenDuena, { rating: 4 }).expect(
        409,
      );
    });

    it('la reseña aparece en el seguimiento', async () => {
      const res = await http()
        .get(`/requests/${solicitudFinalizada}/tracking`)
        .set('Authorization', `Bearer ${tokenDuena}`)
        .expect(200);

      expect(res.body).toHaveProperty('review.rating', 5);
    });
  });
});
