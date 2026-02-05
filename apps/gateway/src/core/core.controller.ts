import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

@Controller('core')
export class CoreController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}
}
