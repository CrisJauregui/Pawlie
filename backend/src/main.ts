import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Valida todos los DTO: rechaza campos que no existen (whitelist y
  // forbidNonWhitelisted) y convierte los tipos (transform).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Todos los errores salen con el mismo formato (ver all-exceptions.filter.ts).
  app.useGlobalFilters(new AllExceptionsFilter());
  // Registra en consola cada petición: método, ruta, código y cuánto tardó.
  app.useGlobalInterceptors(new LoggingInterceptor());
  // Solo el frontend (FRONTEND_URL) puede llamar a la API desde el navegador.
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? 'http://localhost:3001',
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
