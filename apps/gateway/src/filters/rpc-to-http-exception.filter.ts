import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorLike {
  error?: string;
  message?: string | string[];
  name?: string;
  statusCode?: number;
}

function isErrorLike(value: unknown): value is ErrorLike {
  return typeof value === 'object' && value !== null;
}

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (isErrorLike(exceptionResponse)) {
        message = exceptionResponse.message ?? 'Internal server error';
        error = exceptionResponse.error ?? exception.name;
      }
    } else if (isErrorLike(exception) && isErrorLike(exception.error)) {
      const rpcError = exception.error;
      status = rpcError.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
      message = rpcError.message ?? 'Internal server error';
      error = rpcError.error ?? 'RpcError';
    } else if (
      isErrorLike(exception) &&
      typeof exception.statusCode === 'number'
    ) {
      status = exception.statusCode;
      message = exception.message ?? 'Internal server error';
      error = exception.error ?? exception.name ?? 'Error';
    } else if (isErrorLike(exception)) {
      message = exception.message ?? 'Internal server error';
      error = exception.name ?? 'Error';
    }

    console.error('Exception caught in gateway:', {
      error,
      message,
      originalException: exception,
      status,
    });

    response.status(status).json({
      error,
      message: Array.isArray(message) ? message : [message],
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
