import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaregiverProfile } from '../caregivers/caregiver-profile.entity';
import { Service } from './service.entity';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, CaregiverProfile])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
