import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../users/enums/user-role.enum';
import {
  OwnerSummary,
  TrackingResponse,
  TrackingService,
} from './tracking.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  // Datos del dashboard del dueño: contadores y sus últimas solicitudes.
  @Get('owner/summary')
  @Roles(UserRole.OWNER)
  ownerSummary(@CurrentUser() user: AuthUser): Promise<OwnerSummary> {
    return this.trackingService.ownerSummary(user.id);
  }

  // Seguimiento de un servicio: detalle, actualizaciones y reseña.
  // Lo pueden ver el dueño o el cuidador de la solicitud (se valida en el service).
  @Get('requests/:id/tracking')
  tracking(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TrackingResponse> {
    return this.trackingService.findForUser(user.id, user.role, id);
  }
}
