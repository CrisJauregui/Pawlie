import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { REVIEW_TAGS } from '../review-tags';

export class CreateReviewDto {
  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(1, { message: 'La calificación mínima es 1 estrella' })
  @Max(5, { message: 'La calificación máxima es 5 estrellas' })
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El comentario admite máximo 500 caracteres' })
  comment?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(REVIEW_TAGS, { each: true, message: 'Etiqueta no válida' })
  tags?: string[];
}
