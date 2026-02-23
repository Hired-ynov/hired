import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

@Controller('communication')
export class CommunicationController {
  constructor(
    @Inject(microservices.symbols.COMMUNICATION_SERVICE)
    private readonly communicationService: ClientProxy,
  ) {}

  @Get('ping')
  ping() {
    return this.communicationService.send<string, string>('ping', 'ping');
  }
}
