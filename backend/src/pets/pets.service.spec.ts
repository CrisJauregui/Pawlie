import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Pet } from './pet.entity';
import { PetsService } from './pets.service';

describe('PetsService', () => {
  let service: PetsService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PetsService,
        { provide: getRepositoryToken(Pet), useValue: repo },
      ],
    }).compile();
    service = module.get(PetsService);
  });

  it('crea la mascota asociada al dueño autenticado', async () => {
    repo.create.mockImplementation((data: object) => data);
    repo.save.mockImplementation((data: object) => Promise.resolve(data));

    await service.create('owner-1', { name: 'Rocky', species: 'Perro' });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Rocky',
        breed: null,
        owner: { id: 'owner-1' },
      }),
    );
  });

  it('lista solo las mascotas del dueño', async () => {
    repo.find.mockResolvedValue([]);

    await service.findAll('owner-1');

    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { owner: { id: 'owner-1' } } }),
    );
  });

  it('responde 404 si la mascota es de otro dueño', async () => {
    repo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('owner-2', 'pet-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repo.findOneBy).toHaveBeenCalledWith({
      id: 'pet-1',
      owner: { id: 'owner-2' },
    });
  });

  it('actualiza solo los campos enviados', async () => {
    repo.findOneBy.mockResolvedValue({ id: 'pet-1', name: 'Rocky', age: 3 });
    repo.save.mockImplementation((data: object) => Promise.resolve(data));

    const result = await service.update('owner-1', 'pet-1', { age: 4 });

    expect(result).toEqual({ id: 'pet-1', name: 'Rocky', age: 4 });
  });

  it('elimina la mascota del dueño', async () => {
    const pet = { id: 'pet-1' };
    repo.findOneBy.mockResolvedValue(pet);
    repo.remove.mockResolvedValue(pet);

    await service.remove('owner-1', 'pet-1');

    expect(repo.remove).toHaveBeenCalledWith(pet);
  });

  it('responde 409 si la mascota tiene solicitudes asociadas', async () => {
    repo.findOneBy.mockResolvedValue({ id: 'pet-1' });
    repo.remove.mockRejectedValue(
      new QueryFailedError(
        'DELETE',
        [],
        Object.assign(new Error('fk'), { code: '23503' }),
      ),
    );

    await expect(service.remove('owner-1', 'pet-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
