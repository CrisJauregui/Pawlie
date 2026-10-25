import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { Request as ServiceRequest } from '../requests/request.entity';
import { Review } from './review.entity';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let requests: { findOne: jest.Mock };
  let reviews: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    requests = { findOne: jest.fn() };
    reviews = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data: Partial<Review>) => data),
      save: jest.fn((data: Partial<Review>) =>
        Promise.resolve({ id: 'review-1', createdAt: new Date(), ...data }),
      ),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(ServiceRequest), useValue: requests },
        { provide: getRepositoryToken(Review), useValue: reviews },
      ],
    }).compile();
    service = moduleRef.get(ReviewsService);
  });

  it('guarda la reseña de un servicio finalizado del dueño', async () => {
    requests.findOne.mockResolvedValue({
      id: 'req-1',
      status: RequestStatus.FINALIZADA,
    });

    const result = await service.create('owner-1', 'req-1', {
      rating: 5,
      comment: '  Excelente  ',
      tags: ['Muy puntual'],
    });

    // Solo busca solicitudes de ESE dueño.
    expect(requests.findOne).toHaveBeenCalledWith({
      where: { id: 'req-1', owner: { id: 'owner-1' } },
    });
    expect(result).toMatchObject({
      rating: 5,
      comment: 'Excelente',
      tags: ['Muy puntual'],
    });
  });

  it('responde 404 si la solicitud no es del dueño', async () => {
    requests.findOne.mockResolvedValue(null);

    await expect(
      service.create('owner-1', 'req-1', { rating: 5 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([
    RequestStatus.PENDIENTE,
    RequestStatus.ACEPTADA,
    RequestStatus.EN_CURSO,
    RequestStatus.CANCELADA,
  ])('rechaza calificar un servicio %s (409)', async (status) => {
    requests.findOne.mockResolvedValue({ id: 'req-1', status });

    await expect(
      service.create('owner-1', 'req-1', { rating: 5 }),
    ).rejects.toThrow(
      new ConflictException('Solo puedes calificar un servicio finalizado'),
    );
    expect(reviews.save).not.toHaveBeenCalled();
  });

  it('rechaza una segunda reseña para la misma solicitud (409)', async () => {
    requests.findOne.mockResolvedValue({
      id: 'req-1',
      status: RequestStatus.FINALIZADA,
    });
    reviews.findOne.mockResolvedValue({ id: 'review-anterior' });

    await expect(
      service.create('owner-1', 'req-1', { rating: 4 }),
    ).rejects.toThrow(new ConflictException('Ya calificaste este servicio'));
    expect(reviews.save).not.toHaveBeenCalled();
  });
});
