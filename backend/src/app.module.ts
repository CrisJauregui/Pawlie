import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { buildTypeOrmOptions } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PetsModule } from './pets/pets.module';
import { CaregiversModule } from './caregivers/caregivers.module';
import { ServicesModule } from './services/services.module';
import { RequestsModule } from './requests/requests.module';
import { AvailabilityModule } from './availability/availability.module';
import { UpdatesModule } from './updates/updates.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    TypeOrmModule.forRootAsync({
      // ConfigModule ya cargó el .env en process.env.
      useFactory: () => buildTypeOrmOptions(process.env),
    }),
    AuthModule,
    UsersModule,
    PetsModule,
    CaregiversModule,
    ServicesModule,
    RequestsModule,
    AvailabilityModule,
    UpdatesModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
