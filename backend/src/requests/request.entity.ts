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
import { Service } from '../services/service.entity';
import { User } from '../users/user.entity';
import { RequestStatus } from './enums/request-status.enum';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Dueño que reserva.
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @ManyToOne(() => CaregiverProfile, { nullable: false })
  @JoinColumn({ name: 'caregiver_id' })
  caregiver!: CaregiverProfile;

  // Referencia por nombre para no depender de la rama de Ospina.
  // Cuando se junten las ramas: @ManyToOne(() => Pet, ...) y pet: Pet
  @ManyToOne('Pet', { nullable: false })
  @JoinColumn({ name: 'pet_id' })
  pet!: { id: string };

  @ManyToOne(() => Service, { nullable: false })
  @JoinColumn({ name: 'service_id' })
  service!: Service;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt!: Date;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    enumName: 'request_status',
    default: RequestStatus.PENDIENTE,
  })
  status!: RequestStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  // Precio del servicio al momento de reservar (si el cuidador lo cambia después, no afecta).
  @Column({ name: 'total_price', type: 'numeric', precision: 10, scale: 2 })
  totalPrice!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
