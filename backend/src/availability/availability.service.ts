import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaregiverProfile } from '../caregivers/caregiver-profile.entity';
import { Availability } from './availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(CaregiverProfile)
    private readonly profilesRepository: Repository<CaregiverProfile>,
  ) {}

  async create(userId: string, dto: CreateAvailabilityDto): Promise<Availability> {
    const profile = await this.getProfile(userId);
    await this.assertNoOverlap(
      profile.id,
      dto.dayOfWeek,
      dto.startTime,
      dto.endTime,
    );
    const slot = this.availabilityRepository.create({
      caregiver: { id: profile.id },
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });
    return this.availabilityRepository.save(slot);
  }

  async findAll(userId: string): Promise<Availability[]> {
    const profile = await this.getProfile(userId);
    return this.availabilityRepository.find({
      where: { caregiver: { id: profile.id } },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAvailabilityDto,
  ): Promise<Availability> {
    const profile = await this.getProfile(userId);
    const slot = await this.findOwn(profile.id, id);
    const dayOfWeek = dto.dayOfWeek ?? slot.dayOfWeek;
    const startTime = dto.startTime ?? this.normalize(slot.startTime);
    const endTime = dto.endTime ?? this.normalize(slot.endTime);
    await this.assertNoOverlap(profile.id, dayOfWeek, startTime, endTime, id);
    Object.assign(slot, { dayOfWeek, startTime, endTime });
    return this.availabilityRepository.save(slot);
  }

  async remove(userId: string, id: string): Promise<void> {
    const profile = await this.getProfile(userId);
    const slot = await this.findOwn(profile.id, id);
    await this.availabilityRepository.remove(slot);
  }

  private async getProfile(userId: string): Promise<CaregiverProfile> {
    const profile = await this.profilesRepository.findOneBy({
      user: { id: userId },
    });
    if (!profile) {
      throw new NotFoundException(
        'Primero debes crear tu perfil de cuidador',
      );
    }
    return profile;
  }

  private async findOwn(profileId: string, id: string): Promise<Availability> {
    const slot = await this.availabilityRepository.findOneBy({
      id,
      caregiver: { id: profileId },
    });
    if (!slot) {
      throw new NotFoundException('Horario no encontrado');
    }
    return slot;
  }

  // Postgres devuelve "HH:MM:SS"; se compara en "HH:MM", que ordena bien como texto.
  private normalize(time: string): string {
    return time.slice(0, 5);
  }

  private async assertNoOverlap(
    profileId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    if (startTime >= endTime) {
      throw new BadRequestException(
        'La hora de inicio debe ser anterior a la hora de fin',
      );
    }
    const slots = await this.availabilityRepository.find({
      where: { caregiver: { id: profileId }, dayOfWeek },
    });
    const overlaps = slots.some(
      (s) =>
        s.id !== excludeId &&
        this.normalize(s.startTime) < endTime &&
        this.normalize(s.endTime) > startTime,
    );
    if (overlaps) {
      throw new ConflictException(
        'El horario se cruza con otro ya registrado ese día',
      );
    }
  }
}