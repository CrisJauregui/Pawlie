import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request as ServiceRequest } from '../requests/request.entity';
import { ServiceUpdate } from './service-update.entity';
import { UpdatesController } from './updates.controller';
import { UpdatesService } from './updates.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceUpdate, ServiceRequest])],
  controllers: [UpdatesController],
  providers: [UpdatesService],
})
export class UpdatesModule {}