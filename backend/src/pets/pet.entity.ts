import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  species: string;

  @Column({ type: 'varchar', nullable: true })
  breed: string | null;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;
}