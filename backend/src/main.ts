import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Valida todos los DTO: elimina campos no declarados, rechaza campos extra
  // y convierte los tipos (por ejemplo "5" → 5 en parámetros numéricos).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Permite que el frontend (Next.js) llame a la API desde otro dominio.
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? 'http://localhost:3001',
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
