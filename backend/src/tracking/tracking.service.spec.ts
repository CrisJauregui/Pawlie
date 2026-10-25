import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pet } from '../pets/pet.entity';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { Request as ServiceRequest } from '../requests/request.entity';
import { ReviewsService } from '../reviews/reviews.service';
import { ServiceType } from '../services/enums/service-type.enum';
import { ServiceUpdate } from '../updates/service-update.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;
  let requests: { findOne: jest.Mock; find: jest.Mock; count: jest.Mock };
  let updates: { find: jest.Mock };

  const solicitud = {
    id: 'req-1',
    status: RequestStatus.EN_CURSO,
    startAt: new Date('2026-10-25T10:00:00Z'),
    endAt: new Date('2026-10-25T11:00:00Z'),
    totalPrice: '35000.00',
    notes: null,
    createdAt: new Date(),
    owner: { id: 'owner-1', name: 'María González' },
    pet: {
      id: 'pet-1',
      name: 'Max',
      species: 'Perro',
      breed: 'Golden',
      age: 3,
    },
    service: {
      name: 'Paseo de 1 hora',
      type: ServiceType.PASEO,
      durationMinutes: 60,
    },
    caregiver: {
      id: 'cg-1',
      city: 'San Fernando, Cali',
      photoUrl: null,
      user: { id: 'cuidador-1', name: 'Camila Ruiz' },
    },
  };

  beforeEach(async () => {
    requests = {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn(),
    };
    updates = { find: jest.fn().mockResolvedValue([]) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: getRepositoryToken(ServiceRequest), useValue: requests },
        { provide: getRepositoryToken(ServiceUpdate), useValue: updates },
        {
          provide: getRepositoryToken(Pet),
          useValue: { count: jest.fn().mockResolvedValue(3) },
        },
        {
          provide: ReviewsService,
          useValue: { findByRequest: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();
    service = moduleRef.get(TrackingService);
  });

  it('el dueño solo busca entre SUS solicitudes', async () => {
    requests.findOne.mockResolvedValue(solicitud);

    await service.findForUser('owner-1', UserRole.OWNER, 'req-1');

    expect(requests.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'req-1', owner: { id: 'owner-1' } },
      }),
    );
  });

  it('el cuidador solo busca entre las solicitudes que le asignaron', async () => {
    requests.findOne.mockResolvedValue(solicitud);

    await service.findForUser('cuidador-1', UserRole.CAREGIVER, 'req-1');

    expect(requests.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'req-1', caregiver: { user: { id: 'cuidador-1' } } },
      }),
    );
  });

  it('responde 404 si la solicitud no es del usuario', async () => {
    requests.findOne.mockResolvedValue(null);

    await expect(
      service.findForUser('otro', UserRole.OWNER, 'req-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('devuelve el detalle con el precio como número y las actualizaciones', async () => {
    requests.findOne.mockResolvedValue(solicitud);
    updates.find.mockResolvedValue([
      {
        id: 'u1',
        message: 'Salimos al parque',
        photoUrl: null,
        createdAt: new Date(),
      },
    ]);

    const result = await service.findForUser(
      'owner-1',
      UserRole.OWNER,
      'req-1',
    );

    expect(result.totalPrice).toBe(35000);
    expect(result.caregiver.name).toBe('Camila Ruiz');
    expect(result.pet.age).toBe(3);
    expect(result.updates).toHaveLength(1);
    expect(result.review).toBeNull();
  });

  it('el resumen cuenta mascotas, solicitudes activas y finalizadas', async () => {
    requests.count.mockResolvedValueOnce(2).mockResolvedValueOnce(5);

    const result = await service.ownerSummary('owner-1');

    expect(result).toMatchObject({
      pets: 3,
      activeRequests: 2,
      completedServices: 5,
    });
  });
});
