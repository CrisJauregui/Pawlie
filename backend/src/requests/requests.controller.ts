import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { RequestsService, RequestView, StatusChange } from './requests.service';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @Roles(UserRole.OWNER)
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRequestDto,
  ): Promise<RequestView> {
    return this.requestsService.create(user.id, dto);
  }

  // IMPORTANTE: "me" va ANTES de ":id"; si no, Nest trataría "me" como un id.
  @Get('me')
  findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: ListRequestsQueryDto,
  ): Promise<RequestView[]> {
    return this.requestsService.findMine(user.id, user.role, query.status);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RequestView> {
    return this.requestsService.findOne(user.id, user.role, id);
  }

  @Patch(':id/accept')
  @Roles(UserRole.CAREGIVER)
  accept(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StatusChange> {
    return this.requestsService.accept(user.id, id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.CAREGIVER)
  reject(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StatusChange> {
    return this.requestsService.reject(user.id, id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.OWNER)
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StatusChange> {
    return this.requestsService.cancel(user.id, id);
  }
}
