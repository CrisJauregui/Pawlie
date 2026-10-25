import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Request } from '../requests/request.entity';

// Calificación que deja el dueño cuando el servicio termina.
// Una solicitud tiene como máximo una reseña (request_id es único).
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Request, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request!: Request;

  // De 1 a 5 estrellas.
  @Column({ type: 'smallint' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  // Etiquetas rápidas: "Muy puntual", "Regresó feliz"...
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags!: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
