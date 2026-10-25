import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ServiceType } from '../enums/service-type.enum';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(ServiceType)
  type?: ServiceType;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(9999999)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(1440)
  durationMinutes?: number;

  // Desactivar un servicio lo oculta de la búsqueda sin borrar su historial.
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
