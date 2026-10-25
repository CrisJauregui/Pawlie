import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CaregiverProfile } from '../caregivers/caregiver-profile.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './service.entity';

// CRUD de los servicios (Paseo, Cuidado en casa...) que ofrece cada cuidador.
// Un cuidador solo ve y modifica SUS servicios.
@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
    @InjectRepository(CaregiverProfile)
    private readonly profilesRepository: Repository<CaregiverProfile>,
  ) {}

  async create(userId: string, dto: CreateServiceDto): Promise<Service> {
    const profile = await this.getProfile(userId);
    const service = this.servicesRepository.create({
      caregiver: { id: profile.id },
      name: dto.name,
      type: dto.type,
      price: dto.price.toFixed(2),
      durationMinutes: dto.durationMinutes,
      isActive: dto.isActive ?? true,
    });
    return this.servicesRepository.save(service);
  }

  async findAll(userId: string): Promise<Service[]> {
    const profile = await this.getProfile(userId);
    return this.servicesRepository.find({
      where: { caregiver: { id: profile.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Service> {
    const profile = await this.getProfile(userId);
    return this.findOwn(profile.id, id);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateServiceDto,
  ): Promise<Service> {
    const profile = await this.getProfile(userId);
    const service = await this.findOwn(profile.id, id);
    const { price, ...rest } = dto;
    Object.assign(service, rest);
    if (price !== undefined) {
      service.price = price.toFixed(2);
    }
    return this.servicesRepository.save(service);
  }

  async remove(userId: string, id: string): Promise<void> {
    const profile = await this.getProfile(userId);
    const service = await this.findOwn(profile.id, id);
    try {
      await this.servicesRepository.remove(service);
    } catch (error) {
      const code = (error as { driverError?: { code?: string } }).driverError
        ?.code;
      if (error instanceof QueryFailedError && code === '23503') {
        throw new ConflictException(
          'El servicio tiene solicitudes asociadas y no se puede eliminar; desactívalo en su lugar',
        );
      }
      throw error;
    }
  }

  private async getProfile(userId: string): Promise<CaregiverProfile> {
    const profile = await this.profilesRepository.findOneBy({
      user: { id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Primero debes crear tu perfil de cuidador');
    }
    return profile;
  }

  private async findOwn(profileId: string, id: string): Promise<Service> {
    const service = await this.servicesRepository.findOneBy({
      id,
      caregiver: { id: profileId },
    });
    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return service;
  }
}
