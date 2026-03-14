import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorLike {
  err?: unknown;
  error?: string;
  message?: string | string[];
  name?: string;
  status?: number;
  statusCode?: number;
}

function isErrorLike(value: unknown): value is ErrorLike {
  return typeof value === 'object' && value !== null;
}

function pickMessage(value: unknown): string | string[] {
  if (typeof value === 'string' || Array.isArray(value)) {
    return value;
  }
  return 'Internal server error';
}

function getErrorNameFromStatus(statusCode: number): string {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST: {
      return 'BadRequest';
    }
    case HttpStatus.UNAUTHORIZED: {
      return 'Unauthorized';
    }
    case HttpStatus.FORBIDDEN: {
      return 'Forbidden';
    }
    case HttpStatus.NOT_FOUND: {
      return 'NotFound';
    }
    case HttpStatus.CONFLICT: {
      return 'Conflict';
    }
    case HttpStatus.UNPROCESSABLE_ENTITY: {
      return 'UnprocessableEntity';
    }
    case HttpStatus.TOO_MANY_REQUESTS: {
      return 'TooManyRequests';
    }
    default: {
      return statusCode >= HttpStatus.INTERNAL_SERVER_ERROR
        ? 'InternalServerError'
        : 'HttpError';
    }
  }
}

function normalizeErrorName(statusCode: number, errorName: string): string {
  if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    return 'InternalServerError';
  }

  if (
    errorName === 'Error' ||
    errorName === 'RpcError' ||
    errorName === 'HttpException'
  ) {
    return getErrorNameFromStatus(statusCode);
  }

  const compactName = errorName.replaceAll(/\s+/g, '');
  if (compactName.endsWith('Exception')) {
    return compactName.slice(0, -'Exception'.length);
  }

  return compactName;
}

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (isErrorLike(exceptionResponse)) {
        message = pickMessage(exceptionResponse.message);
        error = exceptionResponse.error ?? exception.name;
      }
    } else if (isErrorLike(exception)) {
      const nestedError =
        isErrorLike(exception.error) && exception.error
          ? exception.error
          : (isErrorLike(exception.err) && exception.err
            ? exception.err
            : undefined);

      const source = nestedError ?? exception;

      if (typeof source.status === 'number') {
        status = source.status;
      } else if (typeof source.statusCode === 'number') {
        status = source.statusCode;
      }

      message = pickMessage(source.message);
      error = source.error ?? source.name ?? 'RpcError';
    } else if (typeof exception === 'string') {
      message = exception;
      error = 'Error';
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    error = normalizeErrorName(status, error);

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
