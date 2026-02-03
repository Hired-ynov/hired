import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('files')
export class FilesController {
  constructor(
    @Inject('FILES_SERVICE') private readonly filesService: ClientProxy,
  ) {}
}
