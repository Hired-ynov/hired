import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Déterminer le status code
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Error';

    // Si c'est une HttpException native
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;
      error = (exceptionResponse as any).error || exception.name;
    }
    // Si c'est une erreur RPC de RabbitMQ
    else if (exception?.error) {
      const rpcError = exception.error;
      status = rpcError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      message = rpcError.message || 'Internal server error';
      error = rpcError.error || 'RpcError';
    }
    // Si c'est une erreur avec statusCode (format custom)
    else if (exception?.statusCode) {
      status = exception.statusCode;
      message = exception.message || 'Internal server error';
      error = exception.error || exception.name || 'Error';
    }
    // Autres erreurs
    else {
      message = exception?.message || 'Internal server error';
      error = exception?.name || 'Error';
    }

    // Log pour debugging
    console.error('Exception caught in gateway:', {
      status,
      message,
      error,
      originalException: exception,
    });

    // Réponse HTTP formatée
    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
