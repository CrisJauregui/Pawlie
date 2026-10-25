import { IsEnum, IsOptional } from 'class-validator';
import { RequestStatus } from '../enums/request-status.enum';

// Filtro opcional de GET /requests/me (ej: ?status=PENDIENTE).
export class ListRequestsQueryDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}
