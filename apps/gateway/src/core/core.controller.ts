import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CORE_SERVICE } from '../constants/microservices.constants';

@Controller('core')
export class CoreController {
  constructor(
    @Inject(CORE_SERVICE) private readonly coreService: ClientProxy,
  ) {}
}
