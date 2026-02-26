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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { get } from 'http';
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

@ApiTags('application')
@Controller('application')
export class ApplicationController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Créer une application pour une offre' })
  @ApiResponse({ status: 201, description: 'Application créée' })
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() body: CreateApplicationDTO,
    @CurrentUser() user: UserDTO,
    @UploadedFiles() files?: MulterFile[],
  ): Promise<ApplicationDTO> {
    const createApplication = plainToInstance(CreateApplication, body);
    const application = await firstValueFrom(
      this.coreService.send('core.application.create', {
        createApplication: createApplication,
        userId: getUserId(user),
        files: files,
      }),
    );
    return plainToInstance(ApplicationDTO, application);
  }

  @ApiOperation({ summary: 'Récupérer toutes les applications' })
  @ApiResponse({ status: 201, description: 'Applications récupérées' })
  @Get()
  async findAll(): Promise<ApplicationDTO[]> {
    const applications = (await firstValueFrom(
      this.coreService.send('core.application.findAll', {}),
    )) as ApplicationDTO[];
    return applications.map((application) =>
      plainToInstance(ApplicationDTO, application),
    );
  }

  @ApiOperation({ summary: 'Récupérer mes applications' })
  @ApiResponse({ status: 201, description: 'Applications récupérées' })
  @Get('me')
  async findMyApplications(
    @CurrentUser() user: UserDTO,
  ): Promise<ApplicationDTO[]> {
    const applications = await firstValueFrom(
      this.coreService.send(
        'core.application.findMyApplications',
        getUserId(user),
      ),
    );
    return applications.map((application) =>
      plainToInstance(ApplicationDTO, application),
    );
  }

  @ApiOperation({ summary: 'Récupérer une application pour une offre' })
  @ApiResponse({ status: 201, description: 'Application récupérée' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApplicationDTO> {
    const application = (await firstValueFrom(
      this.coreService.send('core.application.findOne', id),
    )) as ApplicationDTO;
    return plainToInstance(ApplicationDTO, application);
  }

  @ApiOperation({ summary: "Récupérer une application par l'id d'une offre" })
  @ApiResponse({ status: 201, description: 'Application récupérée' })
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

  @ApiOperation({ summary: 'Mettre à jour une application' })
  @ApiResponse({ status: 201, description: 'Application mise à jour' })
  @Put(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateApplication(
    @Param('id') id: string,
    @Body() body: UpdateApplicationDTO,
    @CurrentUser() user: UserDTO,
    @UploadedFiles() files?: MulterFile[],
  ): Promise<ApplicationDTO> {
    const updateApplication = plainToInstance(UpdateApplication, body);
    const application = await firstValueFrom(
      this.coreService.send('core.application.update', {
        id: id,
        updateApplication: updateApplication,
        userId: getUserId(user),
        files: files,
      }),
    );
    return plainToInstance(ApplicationDTO, application);
  }

  @ApiOperation({ summary: 'Supprimer une application' })
  @ApiResponse({ status: 201, description: 'Application supprimée' })
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
