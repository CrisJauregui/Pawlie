import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from '../availability/availability.entity';
import { Pet } from '../pets/pet.entity';
import { Service } from '../services/service.entity';
import { Request } from './request.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([Request, Pet, Service, Availability])],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
