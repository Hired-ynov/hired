import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllRpcExceptionsFilter implements RpcExceptionFilter<any> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    // Format de l'erreur retournée au client
    const error = {
      statusCode: exception?.status || exception?.statusCode || 500,
      message: exception?.message || 'Internal server error',
      error: exception?.name || 'Error',
      timestamp: new Date().toISOString(),
    };

    // Log l'erreur pour le débogage
    console.error('RPC Exception caught:', {
      error: exception?.message,
      stack: exception?.stack,
      statusCode: error.statusCode,
    });

    // Retourner l'erreur dans un format RPC
    return throwError(() => new RpcException(error));
  }
}
