import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export class RabbitMQException extends RpcException {
  constructor(
    statusCode: HttpStatus,
    body: object | string,
    options?: { headers?: Record<string, string | string[]> },
  ) {
    super({
      statusCode,
      message: typeof body == 'string' ? { message: body } : body,
      options,
    });
    this.name = 'RabbitMQException';
  }
}
