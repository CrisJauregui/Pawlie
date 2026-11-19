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
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './pet.entity';
import { PetsService } from './pets.service';

// Endpoints de mascotas. Toda la clase exige token (JwtAuthGuard) y rol
// de dueño (RolesGuard + @Roles(OWNER)); un cuidador recibe 403.
@Controller('pets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  // POST /pets: registra una mascota del dueño que inició sesión.
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePetDto,
  ): Promise<Pet> {
    return this.petsService.create(user.id, dto);
  }

  // GET /pets: solo las mascotas del dueño.
  @Get()
  findAll(@CurrentUser() user: AuthUser): Promise<Pet[]> {
    return this.petsService.findAll(user.id);
  }

  // GET /pets/:id: si la mascota es de otro dueño responde 404.
  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Pet> {
    return this.petsService.findOne(user.id, id);
  }

  // PATCH /pets/:id: edita solo los campos enviados.
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePetDto,
  ): Promise<Pet> {
    return this.petsService.update(user.id, id, dto);
  }

  // DELETE /pets/:id: 204 sin contenido; 409 si tiene solicitudes.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.petsService.remove(user.id, id);
  }
}
