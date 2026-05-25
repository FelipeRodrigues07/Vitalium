import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingPersistenceService } from '../../monitoring/logging-persistence.service';
import { SystemHealthService } from '../../monitoring/system-health.service';
import { BaseException } from '../base/base.exception';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    private readonly systemHealth: SystemHealthService,
    private readonly loggingPersistence: LoggingPersistenceService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let context: any = null;

    if (exception instanceof BaseException) {
      // Nossa exceção customizada
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message;
      errorCode = exceptionResponse.errorCode;
      context = exceptionResponse.context;
    } else if (exception instanceof HttpException) {
      // Exceção HTTP padrão do NestJS
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
    } else if (exception instanceof Error) {
      // Erro genérico do JavaScript
      message = exception.message;
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
    }

    const errorResponse = {
      statusCode: status,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(context && { context }),
    };

    // Log do erro
    this.logger.error(
      `HTTP ${status} | ${request.method} ${request.url} | ${errorCode}: ${message}`,
    );

    // Monitoramento automático de erros críticos
    await this.logErrorToMonitoringSystem(exception, {
      status,
      message,
      errorCode,
      request,
      errorResponse,
    });

    response.status(status).json(errorResponse);
  }

  private async logErrorToMonitoringSystem(
    exception: unknown,
    errorData: {
      status: number;
      message: string;
      errorCode: string;
      request: Request;
      errorResponse: any;
    },
  ): Promise<void> {
    try {
      const { status, message, errorCode, request } = errorData;
      const requestId = (request as any).requestId as string | undefined;
      const userId = (request as any).user?.sub as string | undefined;

      const isCritical = status >= 500;
      const isAuthError = status === 401 || status === 403;
      const isDatabaseError =
        exception instanceof Error &&
        (exception.message.includes('database') ||
          exception.message.includes('prisma') ||
          exception.message.includes('connection'));

      // Persistir ErrorLog para erros 5xx ou erros de autenticação
      if (isCritical || isAuthError) {
        this.loggingPersistence
          .saveErrorLog({
            errorType: errorCode,
            errorMessage: message,
            stackTrace:
              exception instanceof Error ? exception.stack : undefined,
            userId,
            requestId,
            context: `${request.method} ${request.url}`,
            metadata: {
              statusCode: status,
              ip: request.ip,
              userAgent: request.get('User-Agent'),
            },
          })
          .catch(() => {});
      }

      if (isCritical) {
        await this.systemHealth.logCriticalError({
          type: errorCode,
          message: `HTTP ${status}: ${message}`,
          stackTrace: exception instanceof Error ? exception.stack : undefined,
          context: JSON.stringify({
            url: request.url,
            method: request.method,
            ip: request.ip,
            statusCode: status,
          }),
        });
      }

      if (isDatabaseError) {
        await this.systemHealth.logDatabaseFailure({
          operation: `${request.method} ${request.url}`,
          error: message,
          metadata: { statusCode: status, errorCode },
        });
      }

      if (isAuthError) {
        await this.systemHealth.logAuthFailure({
          type: errorCode,
          userId,
          ip: request.ip,
          userAgent: request.get('User-Agent'),
        });
      }
    } catch (monitoringError) {
      this.logger.error(
        'Erro ao registrar no sistema de monitoramento:',
        monitoringError,
      );
    }
  }
}
