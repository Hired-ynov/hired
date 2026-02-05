import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

@Controller('files')
export class FilesController {
  constructor(
    @Inject(microservices.symbols.FILES_SERVICE)
    private readonly filesService: ClientProxy,
  ) {}
}
