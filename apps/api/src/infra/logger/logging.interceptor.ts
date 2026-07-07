import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      const { method, url } = req;
      const now = Date.now();

      return next.handle().pipe(
        tap({
          next: () => {
            const res = context.switchToHttp().getResponse();
            const delay = Date.now() - now;
            this.logger.log({
              type: 'http_request',
              method,
              url,
              statusCode: res.statusCode,
              latencyMs: delay,
            });
          },
          error: (error) => {
            const delay = Date.now() - now;
            const status = error.status || 500;
            this.logger.error({
              type: 'http_request_error',
              method,
              url,
              statusCode: status,
              latencyMs: delay,
              error: error.message,
            });
          },
        }),
      );
    }

    return next.handle();
  }
}
