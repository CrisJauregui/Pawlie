import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Availability } from '../availability/availability.entity';
import { toLocalParts } from '../common/utils/local-time';
import { Pet } from '../pets/pet.entity';
import { ServiceType } from '../services/enums/service-type.enum';
import { Service } from '../services/service.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { RequestStatus } from './enums/request-status.enum';
import { Request as ServiceRequest } from './request.entity';
import { RequestsService } from './requests.service';

// Próximo lunes a la hora local de Colombia indicada (siempre en el futuro).
// Las franjas de las pruebas son de lunes, 08:00 a 12:00.
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

describe('RequestsService', () => {
  let service: RequestsService;
  const requests = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };
  const pets = { findOneBy: jest.fn() };
  const services = { findOne: jest.fn() };
  const availability = { find: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: getRepositoryToken(ServiceRequest), useValue: requests },
        { provide: getRepositoryToken(Pet), useValue: pets },
        { provide: getRepositoryToken(Service), useValue: services },
        { provide: getRepositoryToken(Availability), useValue: availability },
      ],
    }).compile();
    service = module.get(RequestsService);
  });

  // ---------- Crear reserva ----------

  describe('create', () => {
    const start = nextMondayAt(10);
    const dto = {
      caregiverId: 'cg-1',
      serviceId: 'srv-1',
      petId: 'pet-1',
      startAt: start.toISOString(),
    };

    // Solicitud completa tal como la devuelve la base de datos con sus relaciones.
    const storedRequest = {
      id: 'req-1',
      status: RequestStatus.PENDIENTE,
      startAt: start,
      endAt: new Date(start.getTime() + 60 * 60 * 1000),
      totalPrice: '35000.00',
      notes: null,
      createdAt: new Date(),
      service: {
        id: 'srv-1',
        name: 'Paseo de 1 hora',
        type: ServiceType.PASEO,
        durationMinutes: 60,
      },
      pet: { id: 'pet-1', name: 'Max', species: 'Perro', breed: null },
      caregiver: { id: 'cg-1', city: 'Cali', user: { name: 'Camila' } },
      owner: { id: 'owner-1', name: 'María' },
    };

    // Todo en orden por defecto; cada prueba rompe una sola regla.
    beforeEach(() => {
      pets.findOneBy.mockResolvedValue({ id: 'pet-1' });
      services.findOne.mockResolvedValue({
        id: 'srv-1',
        caregiver: { id: 'cg-1' },
        isActive: true,
        durationMinutes: 60,
        price: '35000.00',
      });
      availability.find.mockResolvedValue([
        { startTime: '08:00:00', endTime: '12:00:00' },
      ]);
      requests.count.mockResolvedValue(0);
      requests.create.mockImplementation((data: object) => data);
      requests.save.mockResolvedValue({ id: 'req-1' });
      requests.findOne.mockResolvedValue(storedRequest);
    });

    it('crea la reserva PENDIENTE con el precio del servicio y la hora de fin calculada', async () => {
      const result = await service.create('owner-1', dto);

      expect(requests.create).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: { id: 'owner-1' },
          caregiver: { id: 'cg-1' },
          pet: { id: 'pet-1' },
          service: { id: 'srv-1' },
          startAt: start,
          endAt: new Date(start.getTime() + 60 * 60 * 1000),
          totalPrice: '35000.00',
        }),
      );
      expect(result).toMatchObject({
        id: 'req-1',
        status: RequestStatus.PENDIENTE,
        totalPrice: 35000,
        pet: { name: 'Max' },
        caregiver: { name: 'Camila' },
      });
    });

    it('busca la mascota solo entre las del dueño que reserva', async () => {
      await service.create('owner-1', dto);

      expect(pets.findOneBy).toHaveBeenCalledWith({
        id: 'pet-1',
        owner: { id: 'owner-1' },
      });
    });

    it('rechaza una mascota que no es del dueño (404)', async () => {
      pets.findOneBy.mockResolvedValue(null);

      await expect(service.create('owner-1', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(requests.save).not.toHaveBeenCalled();
    });

    it('rechaza un servicio de otro cuidador (400)', async () => {
      services.findOne.mockResolvedValue({
        id: 'srv-1',
        caregiver: { id: 'otro-cuidador' },
        isActive: true,
        durationMinutes: 60,
        price: '35000.00',
      });

      await expect(service.create('owner-1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(requests.save).not.toHaveBeenCalled();
    });

    it('rechaza un servicio que no existe (400)', async () => {
      services.findOne.mockResolvedValue(null);

      await expect(service.create('owner-1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rechaza un servicio inactivo (400)', async () => {
      services.findOne.mockResolvedValue({
        id: 'srv-1',
        caregiver: { id: 'cg-1' },
        isActive: false,
        durationMinutes: 60,
        price: '35000.00',
      });

      await expect(service.create('owner-1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rechaza una fecha en el pasado (400)', async () => {
      const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      await expect(
        service.create('owner-1', { ...dto, startAt: past }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(requests.save).not.toHaveBeenCalled();
    });

    it('rechaza un día en el que el cuidador no tiene horarios (400)', async () => {
      availability.find.mockResolvedValue([]);

      await expect(service.create('owner-1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rechaza una hora fuera de la franja del cuidador (400)', async () => {
      availability.find.mockResolvedValue([
        { startTime: '14:00:00', endTime: '18:00:00' },
      ]);

      await expect(service.create('owner-1', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rechaza una reserva que termina después de que acaba la franja (400)', async () => {
      // Empieza 11:30 y dura 60 min → termina 12:30, pero la franja acaba a las 12:00.
      const late = nextMondayAt(11, 30).toISOString();

      await expect(
        service.create('owner-1', { ...dto, startAt: late }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('acepta una reserva que termina justo cuando acaba la franja', async () => {
      // Empieza 11:00 y termina 12:00, el límite exacto de la franja.
      const edge = nextMondayAt(11).toISOString();

      await expect(
        service.create('owner-1', { ...dto, startAt: edge }),
      ).resolves.toBeDefined();
    });

    it('rechaza una reserva que se cruza con otra del cuidador (409)', async () => {
      requests.count.mockResolvedValue(1);

      await expect(service.create('owner-1', dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(requests.save).not.toHaveBeenCalled();
    });
  });

  // ---------- Listar y ver ----------

  describe('findMine / findOne', () => {
    it('el dueño solo consulta las solicitudes que él hizo', async () => {
      requests.find.mockResolvedValue([]);

      await service.findMine('user-1', UserRole.OWNER);

      expect(requests.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { owner: { id: 'user-1' } } }),
      );
    });

    it('el cuidador solo consulta las solicitudes que recibió', async () => {
      requests.find.mockResolvedValue([]);

      await service.findMine('user-2', UserRole.CAREGIVER);

      expect(requests.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { caregiver: { user: { id: 'user-2' } } },
        }),
      );
    });

    it('filtra por estado cuando se pide', async () => {
      requests.find.mockResolvedValue([]);

      await service.findMine('user-1', UserRole.OWNER, RequestStatus.PENDIENTE);

      expect(requests.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            owner: { id: 'user-1' },
            status: RequestStatus.PENDIENTE,
          },
        }),
      );
    });

    it('responde 404 si la solicitud no es del usuario', async () => {
      requests.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('user-9', UserRole.OWNER, 'req-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ---------- Aceptar y rechazar (cuidador) ----------

  describe('accept / reject', () => {
    const withStatus = (status: RequestStatus) =>
      requests.findOne.mockResolvedValue({ id: 'req-1', status });

    it('acepta una solicitud PENDIENTE', async () => {
      withStatus(RequestStatus.PENDIENTE);
      requests.update.mockResolvedValue({ affected: 1 });

      const result = await service.accept('user-2', 'req-1');

      expect(result).toEqual({ id: 'req-1', status: RequestStatus.ACEPTADA });
      expect(requests.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'req-1' }),
        { status: RequestStatus.ACEPTADA },
      );
    });

    it('rechaza una solicitud PENDIENTE', async () => {
      withStatus(RequestStatus.PENDIENTE);
      requests.update.mockResolvedValue({ affected: 1 });

      const result = await service.reject('user-2', 'req-1');

      expect(result).toEqual({ id: 'req-1', status: RequestStatus.RECHAZADA });
    });

    it('no acepta una solicitud que ya no está PENDIENTE (409)', async () => {
      withStatus(RequestStatus.ACEPTADA);

      await expect(service.accept('user-2', 'req-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(requests.update).not.toHaveBeenCalled();
    });

    it('no rechaza una solicitud FINALIZADA (409)', async () => {
      withStatus(RequestStatus.FINALIZADA);

      await expect(service.reject('user-2', 'req-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('responde 404 si la solicitud no es de ese cuidador', async () => {
      requests.findOne.mockResolvedValue(null);

      await expect(service.accept('user-9', 'req-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('responde 409 si la solicitud cambió de estado mientras se aceptaba', async () => {
      withStatus(RequestStatus.PENDIENTE);
      requests.update.mockResolvedValue({ affected: 0 });

      await expect(service.accept('user-2', 'req-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  // ---------- Cancelar (dueño) ----------

  describe('cancel', () => {
    const withStatus = (status: RequestStatus) =>
      requests.findOne.mockResolvedValue({ id: 'req-1', status });

    it.each([RequestStatus.PENDIENTE, RequestStatus.ACEPTADA])(
      'cancela una solicitud %s',
      async (status) => {
        withStatus(status);
        requests.update.mockResolvedValue({ affected: 1 });

        const result = await service.cancel('owner-1', 'req-1');

        expect(result).toEqual({
          id: 'req-1',
          status: RequestStatus.CANCELADA,
        });
      },
    );

    it.each([
      RequestStatus.EN_CURSO,
      RequestStatus.FINALIZADA,
      RequestStatus.RECHAZADA,
      RequestStatus.CANCELADA,
    ])('no cancela una solicitud %s (409)', async (status) => {
      withStatus(status);

      await expect(service.cancel('owner-1', 'req-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(requests.update).not.toHaveBeenCalled();
    });

    it('responde 404 si la solicitud es de otro dueño', async () => {
      requests.findOne.mockResolvedValue(null);

      await expect(service.cancel('owner-9', 'req-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
