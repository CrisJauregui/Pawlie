import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CaregiverProfile } from '../caregivers/caregiver-profile.entity';
import { ServiceType } from './enums/service-type.enum';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CaregiverProfile, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caregiver_id' })
  caregiver!: CaregiverProfile;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: ServiceType, enumName: 'service_type' })
  type!: ServiceType;

  // numeric llega como string desde pg: convertir con Number() al calcular.
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
