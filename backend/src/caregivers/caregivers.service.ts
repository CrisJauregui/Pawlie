import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Availability } from '../availability/availability.entity';
import { dayOfWeekOfDate } from '../common/utils/local-time';
import { Review } from '../reviews/review.entity';
import { ServiceType } from '../services/enums/service-type.enum';
import { Service } from '../services/service.entity';
import { CaregiverProfile } from './caregiver-profile.entity';
import { FindCaregiversQueryDto } from './dto/find-caregivers-query.dto';

export interface CaregiverServiceView {
  id: string;
  name: string;
  type: ServiceType;
  price: number;
  durationMinutes: number;
}

export interface CaregiverListItem {
  id: string;
  name: string;
  city: string;
  bio: string | null;
  yearsExperience: number;
  photoUrl: string | null;
  rating: { average: number | null; count: number };
  services: CaregiverServiceView[];
}

export interface CaregiverDetail extends CaregiverListItem {
  availability: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

interface RatingRow {
  caregiver_id: string;
  average: string;
  count: string;
}

// Búsqueda de cuidadores para el dueño (pantallas de /buscar).
@Injectable()
export class CaregiversService {
  constructor(
    @InjectRepository(CaregiverProfile)
    private readonly profilesRepository: Repository<CaregiverProfile>,
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  async findAll(filters: FindCaregiversQueryDto): Promise<CaregiverListItem[]> {
    const query = this.profilesRepository
      .createQueryBuilder('profile')
      .innerJoinAndSelect('profile.user', 'user');

    if (filters.city) {
      // Se escapan % y _ para que se busquen como texto normal.
      const city = filters.city.replace(/[\\%_]/g, '\\$&');
      query.andWhere('profile.city ILIKE :city', { city: `%${city}%` });
    }

    if (filters.type) {
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM services s
          WHERE s.caregiver_id = profile.id AND s.is_active = true AND s.type = :type
        )`,
        { type: filters.type },
      );
    }

    if (filters.date) {
      const dayOfWeek = dayOfWeekOfDate(filters.date);
      if (Number.isNaN(dayOfWeek)) {
        throw new BadRequestException('La fecha no es válida');
      }
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM availability a
          WHERE a.caregiver_id = profile.id AND a.day_of_week = :dayOfWeek
        )`,
        { dayOfWeek },
      );
    }

    const profiles = await query
      .orderBy('profile.yearsExperience', 'DESC')
      .addOrderBy('user.name', 'ASC')
      .getMany();
    if (profiles.length === 0) {
      return [];
    }

    const ids = profiles.map((p) => p.id);
    const [services, ratings] = await Promise.all([
      this.activeServices(ids),
      this.ratings(ids),
    ]);
    return profiles.map((p) => this.toListItem(p, services, ratings));
  }

  async findOne(id: string): Promise<CaregiverDetail> {
    const profile = await this.profilesRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!profile) {
      throw new NotFoundException('Cuidador no encontrado');
    }

    const [services, ratings, slots] = await Promise.all([
      this.activeServices([id]),
      this.ratings([id]),
      this.availabilityRepository.find({
        where: { caregiver: { id } },
        order: { dayOfWeek: 'ASC', startTime: 'ASC' },
      }),
    ]);

    return {
      ...this.toListItem(profile, services, ratings),
      availability: slots.map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        // Postgres devuelve "HH:MM:SS"; al frontend se le entrega "HH:MM".
        startTime: s.startTime.slice(0, 5),
        endTime: s.endTime.slice(0, 5),
      })),
    };
  }

  private activeServices(caregiverIds: string[]): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { caregiver: { id: In(caregiverIds) }, isActive: true },
      relations: { caregiver: true },
      order: { price: 'ASC' },
    });
  }

  // Promedio y cantidad de reseñas por cuidador (las reseñas cuelgan de las solicitudes).
  private async ratings(
    caregiverIds: string[],
  ): Promise<Map<string, { average: number; count: number }>> {
    const rows = await this.reviewsRepository.query<RatingRow[]>(
      `SELECT q.caregiver_id AS caregiver_id,
              AVG(r.rating) AS average,
              COUNT(r.id) AS count
       FROM reviews r
       INNER JOIN requests q ON q.id = r.request_id
       WHERE q.caregiver_id = ANY($1::uuid[])
       GROUP BY q.caregiver_id`,
      [caregiverIds],
    );

    return new Map(
      rows.map((row) => [
        row.caregiver_id,
        {
          average: Math.round(Number(row.average) * 10) / 10,
          count: Number(row.count),
        },
      ]),
    );
  }

  private toListItem(
    profile: CaregiverProfile,
    services: Service[],
    ratings: Map<string, { average: number; count: number }>,
  ): CaregiverListItem {
    const rating = ratings.get(profile.id);
    return {
      id: profile.id,
      name: profile.user.name,
      city: profile.city,
      bio: profile.bio,
      yearsExperience: profile.yearsExperience,
      photoUrl: profile.photoUrl,
      rating: rating ?? { average: null, count: 0 },
      services: services
        .filter((s) => s.caregiver.id === profile.id)
        .map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          price: Number(s.price),
          durationMinutes: s.durationMinutes,
        })),
    };
  }
}