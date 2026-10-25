import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from '../pets/pet.entity';
import { Request } from '../requests/request.entity';
import { ReviewsModule } from '../reviews/reviews.module';
import { ServiceUpdate } from '../updates/service-update.entity';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, ServiceUpdate, Pet]),
    ReviewsModule,
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
