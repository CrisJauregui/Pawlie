import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from '../availability/availability.entity';
import { Review } from '../reviews/review.entity';
import { Service } from '../services/service.entity';
import { CaregiverProfile } from './caregiver-profile.entity';
import { CaregiversController } from './caregivers.controller';
import { CaregiversService } from './caregivers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CaregiverProfile,
      Service,
      Availability,
      Review,
    ]),
  ],
  controllers: [CaregiversController],
  providers: [CaregiversService],
})
export class CaregiversModule {}
