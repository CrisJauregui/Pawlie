import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('caregiver_profiles')
export class CaregiverProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Un usuario CAREGIVER tiene un solo perfil.
  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 100 })
  city!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ name: 'years_experience', type: 'int', default: 0 })
  yearsExperience!: number;

  @Column({ name: 'photo_url', type: 'varchar', length: 300, nullable: true })
  photoUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
