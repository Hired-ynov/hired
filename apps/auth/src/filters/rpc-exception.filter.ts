import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

interface ErrorLike {
  message?: string;
  name?: string;
  stack?: string;
  status?: number;
  statusCode?: number;
}

function isErrorLike(value: unknown): value is ErrorLike {
  return typeof value === 'object' && value !== null;
}

@Catch()
export class AllRpcExceptionsFilter implements RpcExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    const contextType = host.getType();
    const rawError =
      exception instanceof RpcException ? exception.getError() : exception;
    const errorLike = isErrorLike(rawError) ? rawError : {};

    let statusCode = 500;
    if (typeof errorLike.status === 'number') {
      statusCode = errorLike.status;
    } else if (typeof errorLike.statusCode === 'number') {
      statusCode = errorLike.statusCode;
    }

    const errorName =
      typeof errorLike.name === 'string' ? errorLike.name : 'Error';
    const errorMessage =
      typeof errorLike.message === 'string'
        ? errorLike.message
        : 'Internal server error';

    const error = {
      error: errorName,
      message: errorMessage,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    console.error('RPC Exception caught:', {
      contextType,
      error: errorMessage,
      stack: typeof errorLike.stack === 'string' ? errorLike.stack : undefined,
      statusCode: error.statusCode,
    });

    return throwError(() => new RpcException(error));
  }
}
