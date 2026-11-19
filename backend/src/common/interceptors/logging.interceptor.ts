import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Interceptor de logging: mide cuánto tarda cada petición y la registra,
// por ejemplo "GET /pets 200 12ms". Sirve para ver qué pasa en el servidor.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const start = Date.now();

    // next.handle() ejecuta el controller; tap() corre cuando ya hay respuesta.
    return next.handle().pipe(
      tap(() => {
        const response = http.getResponse<Response>();
        this.logger.log(
          `${request.method} ${request.url} ${response.statusCode} ${Date.now() - start}ms`,
        );
      }),
    );
  }
}
