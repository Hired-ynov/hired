import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
  UploadedFiles,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  UserDTO,
  ApplicationDTO,
  CreateApplicationDTO,
  UpdateApplicationDTO,
} from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';

import { CurrentUser } from '../auth/current-user.decorator';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Controller('application')
export class ApplicationController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() body: CreateApplicationDTO,
    @CurrentUser() user: UserDTO,
    @UploadedFiles() files?: MulterFile[],
  ): Promise<ApplicationDTO> {
    return this.coreService.send('core.application.create', {
      body,
      user,
      files,
    });
  }

  @Get()
  async findAll(): Promise<ApplicationDTO[]> {
    return this.coreService.send('application.findAll', {});
  }

  @Get('me')
  async findMyApplications(
    @CurrentUser() user: UserDTO,
  ): Promise<ApplicationDTO[]> {
    return this.coreService.send('core.application.findMyApplication', user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApplicationDTO> {
    return this.coreService.send('core.application.findOne', id);
  }

  @Get('/offer/:id')
  findByOfferId(
    @Param('id') id: string,
    @CurrentUser() user: UserDTO,
  ): Promise<ApplicationDTO[]> {
    return this.coreService.send('core.application.findByOfferId', {
      id,
      user,
    });
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateApplication(
    @Param('id') id: string,
    @Body() body: UpdateApplicationDTO,
    @CurrentUser() user: UserDTO,
    @UploadedFiles() files?: MulterFile[],
  ): Promise<ApplicationDTO> {
    return this.coreService.send('core.application.update', {
      id: +id,
      body,
      user,
      files,
    });
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: UserDTO): Promise<void> {
    return this.coreService.send('core.application.delete', { id: +id, user });
  }
}
