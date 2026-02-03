import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('core')
export class CoreController {
  constructor(
    @Inject('CORE_SERVICE') private readonly coreService: ClientProxy,
  ) {}
}
