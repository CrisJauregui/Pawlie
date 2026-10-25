import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CaregiverDetail,
  CaregiverListItem,
  CaregiversService,
} from './caregivers.service';
import { FindCaregiversQueryDto } from './dto/find-caregivers-query.dto';

// Cualquier usuario con sesión puede consultar cuidadores (sin @Roles).
@Controller('caregivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CaregiversController {
  constructor(private readonly caregiversService: CaregiversService) {}

  @Get()
  findAll(
    @Query() query: FindCaregiversQueryDto,
  ): Promise<CaregiverListItem[]> {
    return this.caregiversService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CaregiverDetail> {
    return this.caregiversService.findOne(id);
  }
}
