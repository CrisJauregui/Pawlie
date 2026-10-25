import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { Request as ServiceRequest } from '../requests/request.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './review.entity';

export interface ReviewResponse {
  id: string;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: Date;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(ServiceRequest)
    private readonly requestsRepository: Repository<ServiceRequest>,
  ) {}

  // Reglas:
  // - Solo el dueño de la solicitud puede calificarla (si no es suya → 404).
  // - Solo se califica un servicio FINALIZADO.
  // - Una sola reseña por solicitud.
  async create(
    ownerId: string,
    requestId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponse> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId, owner: { id: ownerId } },
    });
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (request.status !== RequestStatus.FINALIZADA) {
      throw new ConflictException(
        'Solo puedes calificar un servicio finalizado',
      );
    }
    const existing = await this.reviewsRepository.findOne({
      where: { request: { id: requestId } },
    });
    if (existing) {
      throw new ConflictException('Ya calificaste este servicio');
    }

    const review = await this.reviewsRepository.save(
      this.reviewsRepository.create({
        request: { id: requestId },
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        tags: dto.tags ?? [],
      }),
    );
    return toReviewResponse(review);
  }

  async findByRequest(requestId: string): Promise<ReviewResponse | null> {
    const review = await this.reviewsRepository.findOne({
      where: { request: { id: requestId } },
    });
    return review ? toReviewResponse(review) : null;
  }
}

function toReviewResponse(review: Review): ReviewResponse {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    tags: review.tags,
    createdAt: review.createdAt,
  };
}
