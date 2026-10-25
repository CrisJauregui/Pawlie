import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';
import { Availability } from '../availability/availability.entity';
import { toLocalParts } from '../common/utils/local-time';
import { Pet } from '../pets/pet.entity';
import { ServiceType } from '../services/enums/service-type.enum';
import { Service } from '../services/service.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from './enums/request-status.enum';
import { Request as ServiceRequest } from './request.entity';

// Una reserva ocupa el horario del cuidador mientras siga viva.
const BLOCKING_STATUSES = [
  RequestStatus.PENDIENTE,
  RequestStatus.ACEPTADA,
  RequestStatus.EN_CURSO,
];

// El dueño solo puede cancelar antes de que empiece el servicio.
const CANCELABLE_STATUSES = [RequestStatus.PENDIENTE, RequestStatus.ACEPTADA];

export interface RequestView {
  id: string;
  status: RequestStatus;
  startAt: Date;
  endAt: Date;
  totalPrice: number;
  notes: string | null;
  createdAt: Date;
  service: {
    id: string;
    name: string;
    type: ServiceType;
    durationMinutes: number;
  };
  pet: { id: string; name: string; species: string; breed: string | null };
  caregiver: { id: string; name: string; city: string };
  owner: { id: string; name: string };
}

export interface StatusChange {
  id: string;
  status: RequestStatus;
}

// Reservas (solicitudes): crear, listar y cambiar de estado
// PENDIENTE → ACEPTADA / RECHAZADA / CANCELADA.
// Iniciar y finalizar el servicio lo hace el módulo de actualizaciones.
@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly requestsRepository: Repository<ServiceRequest>,
    @InjectRepository(Pet)
    private readonly petsRepository: Repository<Pet>,
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async create(ownerId: string, dto: CreateRequestDto): Promise<RequestView> {
    // La mascota debe ser del dueño que reserva (si no, responde como si no existiera).
    const pet = await this.petsRepository.findOneBy({
      id: dto.petId,
      owner: { id: ownerId },
    });
    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

    // El servicio debe ser de ese cuidador y estar activo.
    const service = await this.servicesRepository.findOne({
      where: { id: dto.serviceId },
      relations: { caregiver: true },
    });
    if (!service || service.caregiver.id !== dto.caregiverId) {
      throw new BadRequestException('El servicio no pertenece a ese cuidador');
    }
    if (!service.isActive) {
      throw new BadRequestException('El servicio no está activo');
    }

    // La fecha debe ser futura; la hora de fin sale de la duración del servicio.
    const startAt = new Date(dto.startAt);
    if (startAt.getTime() <= Date.now()) {
      throw new BadRequestException('La fecha debe ser futura');
    }
    const endAt = new Date(
      startAt.getTime() + service.durationMinutes * 60 * 1000,
    );

    await this.assertWithinAvailability(dto.caregiverId, startAt, endAt);
    await this.assertNoOverlap(dto.caregiverId, startAt, endAt);

    const request = this.requestsRepository.create({
      owner: { id: ownerId },
      caregiver: { id: dto.caregiverId },
      pet: { id: pet.id },
      service: { id: service.id },
      startAt,
      endAt,
      notes: dto.notes ?? null,
      // Se congela el precio: si el cuidador lo cambia después, esta reserva no se afecta.
      totalPrice: service.price,
    });
    const saved = await this.requestsRepository.save(request);
    return this.findOne(ownerId, UserRole.OWNER, saved.id);
  }

  // Solicitudes del usuario: las que hizo (dueño) o las que recibió (cuidador).
  async findMine(
    userId: string,
    role: UserRole,
    status?: RequestStatus,
  ): Promise<RequestView[]> {
    const where: FindOptionsWhere<ServiceRequest> = {
      ...this.scopeFor(userId, role),
      ...(status ? { status } : {}),
    };
    const requests = await this.requestsRepository.find({
      where,
      relations: this.relations,
      order: { startAt: 'DESC' },
    });
    return requests.map((r) => this.toView(r));
  }

  // Solo la ven el dueño y el cuidador de la solicitud; para cualquier otro
  // usuario responde 404 (no se revela que existe).
  async findOne(
    userId: string,
    role: UserRole,
    id: string,
  ): Promise<RequestView> {
    const request = await this.requestsRepository.findOne({
      where: { id, ...this.scopeFor(userId, role) },
      relations: this.relations,
    });
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return this.toView(request);
  }

  accept(caregiverUserId: string, id: string): Promise<StatusChange> {
    return this.changeStatus(
      { id, caregiver: { user: { id: caregiverUserId } } },
      [RequestStatus.PENDIENTE],
      RequestStatus.ACEPTADA,
      'aceptar',
    );
  }

  reject(caregiverUserId: string, id: string): Promise<StatusChange> {
    return this.changeStatus(
      { id, caregiver: { user: { id: caregiverUserId } } },
      [RequestStatus.PENDIENTE],
      RequestStatus.RECHAZADA,
      'rechazar',
    );
  }

  cancel(ownerId: string, id: string): Promise<StatusChange> {
    return this.changeStatus(
      { id, owner: { id: ownerId } },
      CANCELABLE_STATUSES,
      RequestStatus.CANCELADA,
      'cancelar',
    );
  }

  private readonly relations: FindOptionsRelations<ServiceRequest> = {
    owner: true,
    pet: true,
    service: true,
    caregiver: { user: true },
  };

  private scopeFor(
    userId: string,
    role: UserRole,
  ): FindOptionsWhere<ServiceRequest> {
    return role === UserRole.OWNER
      ? { owner: { id: userId } }
      : { caregiver: { user: { id: userId } } };
  }

  // La reserva debe quedar completa dentro de una franja de disponibilidad del cuidador.
  private async assertWithinAvailability(
    caregiverId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<void> {
    const start = toLocalParts(startAt);
    const end = toLocalParts(endAt);
    if (start.dateKey !== end.dateKey) {
      throw new BadRequestException(
        'El servicio debe empezar y terminar el mismo día',
      );
    }

    const slots = await this.availabilityRepository.find({
      where: { caregiver: { id: caregiverId }, dayOfWeek: start.dayOfWeek },
    });
    // Postgres devuelve "HH:MM:SS"; se compara en "HH:MM", que ordena bien como texto.
    const fits = slots.some(
      (slot) =>
        slot.startTime.slice(0, 5) <= start.time &&
        slot.endTime.slice(0, 5) >= end.time,
    );
    if (!fits) {
      throw new BadRequestException(
        'El cuidador no está disponible en ese horario',
      );
    }
  }

  // No puede cruzarse con otra reserva viva del mismo cuidador.
  private async assertNoOverlap(
    caregiverId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<void> {
    const overlapping = await this.requestsRepository.count({
      where: {
        caregiver: { id: caregiverId },
        status: In(BLOCKING_STATUSES),
        startAt: LessThan(endAt),
        endAt: MoreThan(startAt),
      },
    });
    if (overlapping > 0) {
      throw new ConflictException(
        'El cuidador ya tiene una reserva en ese horario',
      );
    }
  }

  private async changeStatus(
    where: FindOptionsWhere<ServiceRequest>,
    allowedFrom: RequestStatus[],
    to: RequestStatus,
    action: string,
  ): Promise<StatusChange> {
    const request = await this.requestsRepository.findOne({ where });
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (!allowedFrom.includes(request.status)) {
      throw new ConflictException(
        `No se puede ${action} una solicitud ${request.status}`,
      );
    }
    // El UPDATE condicionado al estado evita que dos peticiones simultáneas pasen la validación.
    const result = await this.requestsRepository.update(
      { id: request.id, status: In(allowedFrom) },
      { status: to },
    );
    if (result.affected === 0) {
      throw new ConflictException('La solicitud cambió de estado, reintenta');
    }
    return { id: request.id, status: to };
  }

  private toView(request: ServiceRequest): RequestView {
    const pet = request.pet as Pet;
    return {
      id: request.id,
      status: request.status,
      startAt: request.startAt,
      endAt: request.endAt,
      totalPrice: Number(request.totalPrice),
      notes: request.notes,
      createdAt: request.createdAt,
      service: {
        id: request.service.id,
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
      owner: { id: request.owner.id, name: request.owner.name },
    };
  }
}
