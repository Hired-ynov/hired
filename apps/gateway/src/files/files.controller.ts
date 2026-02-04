import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FILES_SERVICE } from '../constants/microservices.constants';

@Controller('files')
export class FilesController {
  constructor(
    @Inject(FILES_SERVICE) private readonly filesService: ClientProxy,
  ) {}
}
