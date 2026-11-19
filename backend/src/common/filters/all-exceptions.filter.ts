import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Filtro global de errores: cualquier error de la API responde con el mismo
// formato { statusCode, message, path, timestamp }. Así el frontend siempre
// sabe dónde leer el mensaje para mostrarlo.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor';

    // Errores que lanzamos nosotros (NotFoundException, ConflictException…)
    // o el ValidationPipe: se respeta su código y su mensaje.
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as { message: string | string[] }).message;
    } else if (exception instanceof Error) {
      // Cualquier otro error es inesperado: se guarda en el log y el cliente
      // solo recibe un 500 genérico, sin detalles internos.
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
