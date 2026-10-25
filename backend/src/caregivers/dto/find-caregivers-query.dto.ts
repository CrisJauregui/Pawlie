import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ServiceType } from '../../services/enums/service-type.enum';

// Filtros de GET /caregivers (todos opcionales y combinables).
export class FindCaregiversQueryDto {
  // Búsqueda parcial: "cali" encuentra "San Fernando, Cali".
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  // Solo cuidadores que tengan un servicio activo de este tipo.
  @IsOptional()
  @IsEnum(ServiceType)
  type?: ServiceType;

  // Solo cuidadores con disponibilidad ese día de la semana (YYYY-MM-DD).
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener formato YYYY-MM-DD',
  })
  date?: string;
}
