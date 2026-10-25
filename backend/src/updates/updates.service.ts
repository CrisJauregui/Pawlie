import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { Request as ServiceRequest } from '../requests/request.entity';
import { CreateServiceUpdateDto } from './dto/create-service-update.dto';
import { ServiceUpdate } from './service-update.entity';

@Injectable()
export class UpdatesService {
  constructor(
    @InjectRepository(ServiceUpdate)
    private readonly updatesRepository: Repository<ServiceUpdate>,
    @InjectRepository(ServiceRequest)
    private readonly requestsRepository: Repository<ServiceRequest>,
  ) {}

  start(userId: string, requestId: string) {
    return this.transition(
      userId,
      requestId,
      RequestStatus.ACEPTADA,
      RequestStatus.EN_CURSO,
    );
  }

  complete(userId: string, requestId: string) {
    return this.transition(
      userId,
      requestId,
      RequestStatus.EN_CURSO,
      RequestStatus.FINALIZADA,
    );
  }

  async addUpdate(
    userId: string,
    requestId: string,
    dto: CreateServiceUpdateDto,
  ): Promise<ServiceUpdate> {
    const request = await this.findOwnRequest(userId, requestId);
    if (request.status !== RequestStatus.EN_CURSO) {
      throw new ConflictException(
        `Solo se pueden publicar actualizaciones en un servicio EN_CURSO (actual: ${request.status})`,
      );
    }
    const update = this.updatesRepository.create({
      request: { id: request.id },
      message: dto.message,
      photoUrl: dto.photoUrl ?? null,
    });
    return this.updatesRepository.save(update);
  }

  private async findOwnRequest(
    userId: string,
    requestId: string,
  ): Promise<ServiceRequest> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId, caregiver: { user: { id: userId } } },
    });
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return request;
  }

  private async transition(
    userId: string,
    requestId: string,
    from: RequestStatus,
    to: RequestStatus,
  ): Promise<{ id: string; status: RequestStatus }> {
    const request = await this.findOwnRequest(userId, requestId);
    if (request.status !== from) {
      throw new ConflictException(
        `La solicitud debe estar ${from} (actual: ${request.status})`,
      );
    }
    // El UPDATE condicionado al estado evita que dos peticiones simultáneas pasen la validación.
    const result = await this.requestsRepository.update(
      { id: request.id, status: from },
      { status: to },
    );
    if (result.affected === 0) {
      throw new ConflictException('La solicitud cambió de estado, reintenta');
    }
    return { id: request.id, status: to };
  }
}
