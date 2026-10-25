import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CaregiverProfile } from '../caregivers/caregiver-profile.entity';
import { Availability } from './availability.entity';
import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  const slots = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };
  const profiles = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    profiles.findOneBy.mockResolvedValue({ id: 'profile-1' });
    slots.create.mockImplementation((data: object) => data);
    slots.save.mockImplementation((data: object) => Promise.resolve(data));
    const module = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        { provide: getRepositoryToken(Availability), useValue: slots },
        { provide: getRepositoryToken(CaregiverProfile), useValue: profiles },
      ],
    }).compile();
    service = module.get(AvailabilityService);
  });

  const existing = {
    id: 'slot-1',
    dayOfWeek: 1,
    startTime: '09:00:00',
    endTime: '12:00:00',
  };

  it('crea un horario sin cruces', async () => {
    slots.find.mockResolvedValue([existing]);

    const result = await service.create('user-1', {
      dayOfWeek: 1,
      startTime: '14:00',
      endTime: '18:00',
    });

    expect(result).toEqual(
      expect.objectContaining({ caregiver: { id: 'profile-1' } }),
    );
  });

  it('permite horarios contiguos (uno termina cuando empieza el otro)', async () => {
    slots.find.mockResolvedValue([existing]);

    await expect(
      service.create('user-1', {
        dayOfWeek: 1,
        startTime: '12:00',
        endTime: '14:00',
      }),
    ).resolves.toBeDefined();
  });

  it('rechaza un horario que se cruza con otro', async () => {
    slots.find.mockResolvedValue([existing]);

    await expect(
      service.create('user-1', {
        dayOfWeek: 1,
        startTime: '11:00',
        endTime: '13:00',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza si la hora de inicio no es anterior a la de fin', async () => {
    await expect(
      service.create('user-1', {
        dayOfWeek: 1,
        startTime: '15:00',
        endTime: '15:00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('responde 404 si el cuidador no tiene perfil', async () => {
    profiles.findOneBy.mockResolvedValue(null);

    await expect(service.findAll('user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('responde 404 al borrar un horario de otro cuidador', async () => {
    slots.findOneBy.mockResolvedValue(null);

    await expect(service.remove('user-1', 'slot-9')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
