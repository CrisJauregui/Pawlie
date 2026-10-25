import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  caregiverId!: string;

  @IsUUID()
  serviceId!: string;

  @IsUUID()
  petId!: string;

  // Fecha y hora de inicio en formato ISO 8601 (ej: 2026-10-27T15:00:00Z).
  // La hora de fin se calcula con la duración del servicio.
  @IsDateString()
  startAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
