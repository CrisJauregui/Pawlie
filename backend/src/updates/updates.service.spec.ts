import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { Request as ServiceRequest } from '../requests/request.entity';
import { ServiceUpdate } from './service-update.entity';
import { UpdatesService } from './updates.service';

describe('UpdatesService', () => {
  let service: UpdatesService;
  const updates = { create: jest.fn(), save: jest.fn() };
  const requests = { findOne: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    updates.create.mockImplementation((data: object) => data);
    updates.save.mockImplementation((data: object) => Promise.resolve(data));
    const module = await Test.createTestingModule({
      providers: [
        UpdatesService,
        { provide: getRepositoryToken(ServiceUpdate), useValue: updates },
        { provide: getRepositoryToken(ServiceRequest), useValue: requests },
      ],
    }).compile();
    service = module.get(UpdatesService);
  });

  const withStatus = (status: RequestStatus) =>
    requests.findOne.mockResolvedValue({ id: 'req-1', status });

  it('inicia un servicio ACEPTADA y pasa a EN_CURSO', async () => {
    withStatus(RequestStatus.ACEPTADA);
    requests.update.mockResolvedValue({ affected: 1 });

    const result = await service.start('user-1', 'req-1');

    expect(result).toEqual({ id: 'req-1', status: RequestStatus.EN_CURSO });
    expect(requests.update).toHaveBeenCalledWith(
      { id: 'req-1', status: RequestStatus.ACEPTADA },
      { status: RequestStatus.EN_CURSO },
    );
  });

  it('no inicia un servicio que no está ACEPTADA', async () => {
    withStatus(RequestStatus.PENDIENTE);

    await expect(service.start('user-1', 'req-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(requests.update).not.toHaveBeenCalled();
  });

  it('responde 404 si la solicitud no es de ese cuidador', async () => {
    requests.findOne.mockResolvedValue(null);

    await expect(service.start('user-2', 'req-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('responde 409 si el estado cambió entre la lectura y el UPDATE', async () => {
    withStatus(RequestStatus.ACEPTADA);
    requests.update.mockResolvedValue({ affected: 0 });

    await expect(service.start('user-1', 'req-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('publica una actualización solo si está EN_CURSO', async () => {
    withStatus(RequestStatus.EN_CURSO);

    await service.addUpdate('user-1', 'req-1', { message: 'Paseo iniciado' });

    expect(updates.create).toHaveBeenCalledWith({
      request: { id: 'req-1' },
      message: 'Paseo iniciado',
      photoUrl: null,
    });
  });

  it('rechaza una actualización si el servicio no está EN_CURSO', async () => {
    withStatus(RequestStatus.ACEPTADA);

    await expect(
      service.addUpdate('user-1', 'req-1', { message: 'Hola' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(updates.save).not.toHaveBeenCalled();
  });

  it('finaliza un servicio EN_CURSO', async () => {
    withStatus(RequestStatus.EN_CURSO);
    requests.update.mockResolvedValue({ affected: 1 });

    const result = await service.complete('user-1', 'req-1');

    expect(result.status).toBe(RequestStatus.FINALIZADA);
  });

  it('no finaliza un servicio que no está EN_CURSO', async () => {
    withStatus(RequestStatus.ACEPTADA);

    await expect(service.complete('user-1', 'req-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
