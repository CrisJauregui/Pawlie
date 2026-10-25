import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pet } from '../pets/pet.entity';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { Request as ServiceRequest } from '../requests/request.entity';
import { ReviewResponse, ReviewsService } from '../reviews/reviews.service';
import { ServiceType } from '../services/enums/service-type.enum';
import { ServiceUpdate } from '../updates/service-update.entity';
import { UserRole } from '../users/enums/user-role.enum';

const ACTIVE_STATUSES = [
  RequestStatus.PENDIENTE,
  RequestStatus.ACEPTADA,
  RequestStatus.EN_CURSO,
];

export interface RequestSummary {
  id: string;
  status: RequestStatus;
  startAt: Date;
  endAt: Date;
  totalPrice: number;
  service: { name: string; type: ServiceType; durationMinutes: number };
  pet: { id: string; name: string; species: string; breed: string | null };
  caregiver: { id: string; name: string; city: string };
}

export interface TrackingResponse extends RequestSummary {
  notes: string | null;
  createdAt: Date;
  pet: RequestSummary['pet'] & { age: number | null };
  caregiver: RequestSummary['caregiver'] & { photoUrl: string | null };
  owner: { id: string; name: string };
  updates: {
    id: string;
    message: string;
    photoUrl: string | null;
    createdAt: Date;
  }[];
  review: ReviewResponse | null;
}

export interface OwnerSummary {
  pets: number;
  activeRequests: number;
  completedServices: number;
  requests: RequestSummary[];
}

// Consultas del dueño: resumen del dashboard y seguimiento de un servicio.
@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly requestsRepository: Repository<ServiceRequest>,
    @InjectRepository(ServiceUpdate)
    private readonly updatesRepository: Repository<ServiceUpdate>,
    @InjectRepository(Pet)
    private readonly petsRepository: Repository<Pet>,
    private readonly reviewsService: ReviewsService,
  ) {}

  async ownerSummary(ownerId: string): Promise<OwnerSummary> {
    const [pets, activeRequests, completedServices, requests] =
      await Promise.all([
        this.petsRepository.count({ where: { owner: { id: ownerId } } }),
        this.requestsRepository.count({
          where: { owner: { id: ownerId }, status: In(ACTIVE_STATUSES) },
        }),
        this.requestsRepository.count({
          where: {
            owner: { id: ownerId },
            status: RequestStatus.FINALIZADA,
          },
        }),
        this.requestsRepository.find({
          where: { owner: { id: ownerId } },
          relations: { pet: true, service: true, caregiver: { user: true } },
          order: { startAt: 'DESC' },
          take: 20,
        }),
      ]);

    return {
      pets,
      activeRequests,
      completedServices,
      requests: requests.map(toSummary),
    };
  }

  // Detalle + actualizaciones + reseña de una solicitud.
  // Solo lo pueden ver el dueño y el cuidador de esa solicitud; para
  // cualquier otro usuario responde 404 (no se revela que la solicitud existe).
  async findForUser(
    userId: string,
    role: UserRole,
    requestId: string,
  ): Promise<TrackingResponse> {
    const request = await this.requestsRepository.findOne({
      where:
        role === UserRole.OWNER
          ? { id: requestId, owner: { id: userId } }
          : { id: requestId, caregiver: { user: { id: userId } } },
      relations: {
        owner: true,
        pet: true,
        service: true,
        caregiver: { user: true },
      },
    });
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    const [updates, review] = await Promise.all([
      this.updatesRepository.find({
        where: { request: { id: requestId } },
        order: { createdAt: 'ASC' },
      }),
      this.reviewsService.findByRequest(requestId),
    ]);

    const pet = request.pet as Pet;
    const summary = toSummary(request);
    return {
      ...summary,
      notes: request.notes,
      createdAt: request.createdAt,
      pet: { ...summary.pet, age: pet.age },
      caregiver: {
        ...summary.caregiver,
        photoUrl: request.caregiver.photoUrl,
      },
      owner: { id: request.owner.id, name: request.owner.name },
      updates: updates.map((u) => ({
        id: u.id,
        message: u.message,
        photoUrl: u.photoUrl,
        createdAt: u.createdAt,
      })),
      review,
    };
  }
}

function toSummary(request: ServiceRequest): RequestSummary {
  const pet = request.pet as Pet;
  return {
    id: request.id,
    status: request.status,
    startAt: request.startAt,
    endAt: request.endAt,
    totalPrice: Number(request.totalPrice),
    service: {
      name: request.service.name,
      type: request.service.type,
      durationMinutes: request.service.durationMinutes,
    },
    pet: {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
    },
    caregiver: {
      id: request.caregiver.id,
      name: request.caregiver.user.name,
      city: request.caregiver.city,
    },
  };
}
