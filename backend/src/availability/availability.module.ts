import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability])],
})
export class AvailabilityModule {}
