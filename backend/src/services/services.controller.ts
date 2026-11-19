import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './service.entity';
import { ServicesService } from './services.service';

// Servicios que ofrece el cuidador (pantalla Mis servicios). Solo cuidadores.
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CAREGIVER)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // POST /services: crea un servicio con nombre, tipo, precio y duración.
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateServiceDto,
  ): Promise<Service> {
    return this.servicesService.create(user.id, dto);
  }

  // GET /services: los servicios del cuidador que inició sesión.
  @Get()
  findAll(@CurrentUser() user: AuthUser): Promise<Service[]> {
    return this.servicesService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Service> {
    return this.servicesService.findOne(user.id, id);
  }

  // PATCH /services/:id: cambia precio, duración o lo activa/desactiva.
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.update(user.id, id, dto);
  }

  // DELETE /services/:id: borra un servicio propio.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.servicesService.remove(user.id, id);
  }
}
