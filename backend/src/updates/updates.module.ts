import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceUpdate } from './service-update.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceUpdate])],
})
export class UpdatesModule {}