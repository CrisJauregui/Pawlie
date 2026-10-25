import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { CaregiverProfile } from '../src/caregivers/caregiver-profile.entity';
import { toLocalParts } from '../src/common/utils/local-time';
import { RequestStatus } from '../src/requests/enums/request-status.enum';
import { UserRole } from '../src/users/enums/user-role.enum';

// Próximo lunes a la hora local de Colombia indicada (siempre en el futuro).
function nextMondayAt(localHour: number, localMinutes = 0): Date {
  const today = new Date();
  for (let i = 1; i <= 8; i++) {
    // Colombia es UTC-5: las 10:00 locales son las 15:00 UTC.
    const candidate = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + i,
        localHour + 5,
        localMinutes,
      ),
    );
    if (toLocalParts(candidate).dayOfWeek === 1) {
      return candidate;
    }
  }
  throw new Error('No se encontró el próximo lunes');
}

// Prueba de punta a punta de buscar cuidadores, reservar y que el cuidador acepte:
// se levanta la API completa contra la base de datos de pruebas y se hacen
// las mismas peticiones que hace el frontend.
describe('Buscar y reservar (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  let tokenDuena: string;
  let tokenOtraDuena: string;
  let tokenCuidadora: string;
  let tokenOtroCuidador: string;

  let caregiverId: string;
  let serviceId: string;
  let petId: string;

  const PASSWORD = 'Pawlie123';
  const http = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

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

  // Reserva con la mascota y el servicio de la prueba (lunes a la hora local indicada).
  const reservar = (token: string, startAt: Date, body: object = {}) =>
    http()
      .post('/requests')
      .set(auth(token))
      .send({
        caregiverId,
        serviceId,
        petId,
        startAt: startAt.toISOString(),
        notes: 'Max es muy sociable',
        ...body,
      });

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

    const duena = await registrar(
      'María Dueña',
      'maria@reservas.test',
      UserRole.OWNER,
    );
    const otraDuena = await registrar(
      'Laura Dueña',
      'laura@reservas.test',
      UserRole.OWNER,
    );
    const cuidadora = await registrar(
      'Camila Cuidadora',
      'camila@reservas.test',
      UserRole.CAREGIVER,
    );
    const otroCuidador = await registrar(
      'Andrés Cuidador',
      'andres@reservas.test',
      UserRole.CAREGIVER,
    );
    tokenDuena = duena.token;
    tokenOtraDuena = otraDuena.token;
    tokenCuidadora = cuidadora.token;
    tokenOtroCuidador = otroCuidador.token;

    // Perfil de la cuidadora (todavía no hay endpoint, se crea directo).
    const perfil = await dataSource.getRepository(CaregiverProfile).save({
      user: { id: cuidadora.id },
      city: 'San Fernando, Cali',
      bio: 'Amo los animales',
      yearsExperience: 4,
    });
    caregiverId = perfil.id;
    await dataSource.getRepository(CaregiverProfile).save({
      user: { id: otroCuidador.id },
      city: 'Bogotá',
    });

    // Servicio y disponibilidad con los endpoints reales.
    const servicio = await http()
      .post('/services')
      .set(auth(tokenCuidadora))
      .send({
        name: 'Paseo de 1 hora',
        type: 'PASEO',
        price: 35000,
        durationMinutes: 60,
      })
      .expect(201);
    serviceId = (servicio.body as { id: string }).id;

    // Lunes de 8:00 a 12:00.
    await http()
      .post('/availability')
      .set(auth(tokenCuidadora))
      .send({ dayOfWeek: 1, startTime: '08:00', endTime: '12:00' })
      .expect(201);

    const mascota = await http()
      .post('/pets')
      .set(auth(tokenDuena))
      .send({ name: 'Max', species: 'Perro', breed: 'Golden Retriever' })
      .expect(201);
    petId = (mascota.body as { id: string }).id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Servicios del cuidador', () => {
    it('un dueño no puede crear servicios (403)', async () => {
      await http()
        .post('/services')
        .set(auth(tokenDuena))
        .send({
          name: 'Baño',
          type: 'BANO',
          price: 40000,
          durationMinutes: 60,
        })
        .expect(403);
    });

    it('rechaza un precio inválido (400)', async () => {
      await http()
        .post('/services')
        .set(auth(tokenCuidadora))
        .send({ name: 'Baño', type: 'BANO', price: -5, durationMinutes: 60 })
        .expect(400);
    });

    it('un cuidador no puede modificar el servicio de otro (404)', async () => {
      await http()
        .patch(`/services/${serviceId}`)
        .set(auth(tokenOtroCuidador))
        .send({ price: 1000 })
        .expect(404);
    });
  });

  describe('GET /caregivers', () => {
    it('filtra por ciudad, tipo de servicio y fecha', async () => {
      const fecha = toLocalParts(nextMondayAt(10)).dateKey;
      const res = await http()
        .get(`/caregivers?city=cali&type=PASEO&date=${fecha}`)
        .set(auth(tokenDuena))
        .expect(200);

      const lista = res.body as { id: string; services: { price: number }[] }[];
      expect(lista).toHaveLength(1);
      expect(lista[0].id).toBe(caregiverId);
      expect(lista[0].services[0].price).toBe(35000);
    });

    it('no devuelve cuidadores sin disponibilidad ese día', async () => {
      // Un martes: la cuidadora solo atiende los lunes.
      const martes = toLocalParts(
        new Date(nextMondayAt(10).getTime() + 24 * 60 * 60 * 1000),
      ).dateKey;
      const res = await http()
        .get(`/caregivers?date=${martes}`)
        .set(auth(tokenDuena))
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    it('rechaza una fecha con formato incorrecto (400)', async () => {
      await http()
        .get('/caregivers?date=26-10-2026')
        .set(auth(tokenDuena))
        .expect(400);
    });

    it('devuelve el perfil con servicios y disponibilidad', async () => {
      const res = await http()
        .get(`/caregivers/${caregiverId}`)
        .set(auth(tokenDuena))
        .expect(200);

      expect(res.body).toMatchObject({
        id: caregiverId,
        name: 'Camila Cuidadora',
        city: 'San Fernando, Cali',
        rating: { average: null, count: 0 },
      });
      expect(res.body).toHaveProperty('availability.0.startTime', '08:00');
    });

    it('sin token responde 401', async () => {
      await http().get('/caregivers').expect(401);
    });
  });

  describe('Reservar y aceptar', () => {
    let solicitudId: string;

    it('la dueña reserva y queda PENDIENTE con el precio del servicio', async () => {
      const res = await reservar(tokenDuena, nextMondayAt(10)).expect(201);

      expect(res.body).toMatchObject({
        status: RequestStatus.PENDIENTE,
        totalPrice: 35000,
        pet: { name: 'Max' },
        caregiver: { name: 'Camila Cuidadora' },
      });
      solicitudId = (res.body as { id: string }).id;
    });

    it('una reserva que se cruza con la anterior responde 409', async () => {
      await reservar(tokenDuena, nextMondayAt(10, 30)).expect(409);
    });

    it('una hora fuera de la disponibilidad responde 400', async () => {
      await reservar(tokenDuena, nextMondayAt(15)).expect(400);
    });

    it('una fecha pasada responde 400', async () => {
      await reservar(tokenDuena, new Date(Date.now() - 60 * 60 * 1000)).expect(
        400,
      );
    });

    it('no se puede reservar con la mascota de otra dueña (404)', async () => {
      await reservar(tokenOtraDuena, nextMondayAt(11)).expect(404);
    });

    it('un cuidador no puede reservar (403)', async () => {
      await reservar(tokenCuidadora, nextMondayAt(11)).expect(403);
    });

    it('la dueña y la cuidadora la ven en GET /requests/me', async () => {
      const duena = await http()
        .get('/requests/me?status=PENDIENTE')
        .set(auth(tokenDuena))
        .expect(200);
      const cuidadora = await http()
        .get('/requests/me')
        .set(auth(tokenCuidadora))
        .expect(200);
      const otroCuidador = await http()
        .get('/requests/me')
        .set(auth(tokenOtroCuidador))
        .expect(200);

      expect(duena.body).toHaveLength(1);
      expect(cuidadora.body).toHaveLength(1);
      expect(otroCuidador.body).toHaveLength(0);
    });

    it('otra dueña no ve la solicitud (404)', async () => {
      await http()
        .get(`/requests/${solicitudId}`)
        .set(auth(tokenOtraDuena))
        .expect(404);
    });

    it('la dueña no puede aceptar su propia solicitud (403)', async () => {
      await http()
        .patch(`/requests/${solicitudId}/accept`)
        .set(auth(tokenDuena))
        .expect(403);
    });

    it('otro cuidador no puede aceptarla (404)', async () => {
      await http()
        .patch(`/requests/${solicitudId}/accept`)
        .set(auth(tokenOtroCuidador))
        .expect(404);
    });

    it('la cuidadora la acepta y pasa a ACEPTADA', async () => {
      const res = await http()
        .patch(`/requests/${solicitudId}/accept`)
        .set(auth(tokenCuidadora))
        .expect(200);

      expect(res.body).toEqual({
        id: solicitudId,
        status: RequestStatus.ACEPTADA,
      });
    });

    it('aceptarla otra vez responde 409', async () => {
      await http()
        .patch(`/requests/${solicitudId}/accept`)
        .set(auth(tokenCuidadora))
        .expect(409);
    });

    it('la dueña cancela una solicitud ACEPTADA y el horario queda libre', async () => {
      await http()
        .patch(`/requests/${solicitudId}/cancel`)
        .set(auth(tokenDuena))
        .expect(200);
      await http()
        .patch(`/requests/${solicitudId}/cancel`)
        .set(auth(tokenDuena))
        .expect(409);

      // El mismo horario ya se puede reservar de nuevo.
      const nueva = await reservar(tokenDuena, nextMondayAt(10)).expect(201);

      // La cuidadora esta vez la rechaza.
      const id = (nueva.body as { id: string }).id;
      const res = await http()
        .patch(`/requests/${id}/reject`)
        .set(auth(tokenCuidadora))
        .expect(200);
      expect(res.body).toHaveProperty('status', RequestStatus.RECHAZADA);
    });

    it('un servicio desactivado ya no se puede reservar (400)', async () => {
      await http()
        .patch(`/services/${serviceId}`)
        .set(auth(tokenCuidadora))
        .send({ isActive: false })
        .expect(200);

      await reservar(tokenDuena, nextMondayAt(9)).expect(400);
    });
  });
});
