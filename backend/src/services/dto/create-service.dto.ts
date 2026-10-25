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

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEnum(ServiceType)
  type!: ServiceType;

  // En pesos colombianos, con máximo 2 decimales.
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(9999999)
  price!: number;

  @IsInt()
  @Min(15)
  @Max(1440)
  durationMinutes!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
