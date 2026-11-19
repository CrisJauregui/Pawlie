import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateServiceUpdateDto } from './dto/create-service-update.dto';
import { ServiceUpdate } from './service-update.entity';
import { UpdatesService } from './updates.service';

// Acciones del cuidador sobre un servicio: iniciar, publicar avances y
// finalizar. Solo para cuidadores (403 para un dueño).
@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CAREGIVER)
export class UpdatesController {
  constructor(private readonly updatesService: UpdatesService) {}

  // ACEPTADA → EN_CURSO
  @Patch(':id/start')
  start(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.updatesService.start(user.id, id);
  }

  // Publica un avance que el dueño ve en su línea de tiempo (solo EN_CURSO).
  @Post(':id/updates')
  addUpdate(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateServiceUpdateDto,
  ): Promise<ServiceUpdate> {
    return this.updatesService.addUpdate(user.id, id, dto);
  }

  // EN_CURSO → FINALIZADA (después el dueño puede calificar).
  @Patch(':id/complete')
  complete(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.updatesService.complete(user.id, id);
  }
}
