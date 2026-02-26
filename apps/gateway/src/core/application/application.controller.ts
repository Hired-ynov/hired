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
import { CurrentUser } from '@repo/commun';
import {
  UserDTO,
  ApplicationDTO,
  CreateApplicationDTO,
  UpdateApplicationDTO,
  CreateApplication,
  UpdateApplication,
} from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { getUserId } from 'src/utils/user-id.utils';

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
    const createApplication = plainToInstance(CreateApplication, body);
    const application = (await firstValueFrom(
      this.coreService.send('core.application.create', {
        createApplication: createApplication,
        userId: getUserId(user),
        files: files,
      }),
    )) as ApplicationDTO;
    return plainToInstance(ApplicationDTO, application);
  }

  @Get()
  async findAll(): Promise<ApplicationDTO[]> {
    const applications = (await firstValueFrom(
      this.coreService.send('core.application.findAll', {}),
    )) as ApplicationDTO[];
    return applications.map((application) =>
      plainToInstance(ApplicationDTO, application),
    );
  }

  @Get('me')
  async findMyApplications(
    @CurrentUser() user: UserDTO,
  ): Promise<ApplicationDTO[]> {
    const applications = (await firstValueFrom(
      this.coreService.send(
        'core.application.findMyApplications',
        getUserId(user),
      ),
    )) as ApplicationDTO[];
    return applications.map((application) =>
      plainToInstance(ApplicationDTO, application),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApplicationDTO> {
    const application = (await firstValueFrom(
      this.coreService.send('core.application.findOne', id),
    )) as ApplicationDTO;
    return plainToInstance(ApplicationDTO, application);
  }

  @Get('/offer/:id')
  async findByOfferId(
    @Param('id') id: string,
    @CurrentUser() user: UserDTO,
  ): Promise<ApplicationDTO[]> {
    const applications = (await firstValueFrom(
      this.coreService.send('core.application.findByOfferId', {
        id,
        userId: getUserId(user),
      }),
    )) as ApplicationDTO[];
    return applications.map((application) =>
      plainToInstance(ApplicationDTO, application),
    );
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateApplication(
    @Param('id') id: string,
    @Body() body: UpdateApplicationDTO,
    @CurrentUser() user: UserDTO,
    @UploadedFiles() files?: MulterFile[],
  ): Promise<ApplicationDTO> {
    const updateApplication = plainToInstance(UpdateApplication, body);
    const application = (await firstValueFrom(
      this.coreService.send('core.application.update', {
        id: id,
        updateApplication: updateApplication,
        userId: getUserId(user),
        files: files,
      }),
    )) as ApplicationDTO;
    return plainToInstance(ApplicationDTO, application);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: UserDTO): Promise<void> {
    return firstValueFrom(
      this.coreService.send('core.application.delete', {
        id,
        userId: getUserId(user),
      }),
    );
  }
}
