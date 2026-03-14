import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

interface ErrorLike {
  error?: unknown;
  message?: string | string[];
  name?: string;
  stack?: string;
  status?: number;
  statusCode?: number;
}

function isErrorLike(value: unknown): value is ErrorLike {
  return typeof value === 'object' && value !== null;
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
export class AllRpcExceptionsFilter implements RpcExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    const contextType = host.getType();
    const rawError =
      exception instanceof RpcException ? exception.getError() : exception;
    const errorLike = isErrorLike(rawError) ? rawError : undefined;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorName = 'Error';
    let message: string | string[] = 'Internal server error';

    if (rawError instanceof HttpException) {
      statusCode = rawError.getStatus();
      const response = rawError.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (isErrorLike(response)) {
        if (typeof response.statusCode === 'number') {
          statusCode = response.statusCode;
        }
        if (
          typeof response.message === 'string' ||
          Array.isArray(response.message)
        ) {
          message = response.message;
        }
        if (typeof response.error === 'string') {
          errorName = response.error;
        }
      }
      if (errorName === 'Error') {
        errorName = rawError.name;
      }
    } else if (typeof rawError === 'string') {
      statusCode = HttpStatus.BAD_REQUEST;
      errorName = 'BadRequest';
      message = rawError;
    } else if (errorLike) {
      if (typeof errorLike.status === 'number') {
        statusCode = errorLike.status;
      } else if (typeof errorLike.statusCode === 'number') {
        statusCode = errorLike.statusCode;
      }

      if (
        typeof errorLike.message === 'string' ||
        Array.isArray(errorLike.message)
      ) {
        message = errorLike.message;
      }

      if (typeof errorLike.name === 'string') {
        errorName = errorLike.name;
      }
    }

    // Never leak internals for 5xx across microservice boundaries.
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'Internal server error';
    }

    errorName = normalizeErrorName(statusCode, errorName);

    const error = {
      error: errorName,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    console.error('RPC Exception caught:', {
      contextType,
      error: message,
      stack: typeof errorLike?.stack === 'string' ? errorLike.stack : undefined,
      statusCode: error.statusCode,
    });

    return throwError(() => new RpcException(error));
  }
}
