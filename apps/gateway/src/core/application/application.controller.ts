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
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

@ApiTags('application')
@ApiBearerAuth('access-token')
@Controller('application')
export class ApplicationController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer une application pour une offre' })
  @ApiResponse({ description: 'Application créée', status: 201 })
  @ApiBody({
    schema: {
      properties: {
        files: {
          items: {
            format: 'binary',
            type: 'string',
          },
          type: 'array',
        },
        firstMessage: { type: 'string' },
        offerId: { type: 'string' },
      },
      type: 'object',
    },
  })
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() body: CreateApplicationDTO,
    @CurrentUser() user: UserDTO,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ApplicationDTO> {
    const createApplication = plainToInstance(CreateApplication, body);
    const application = await firstValueFrom<ApplicationDTO>(
      this.coreService.send('core.application.create', {
        createApplication: createApplication,
        files: files,
        userId: getUserId(user),
      }),
    );
    return plainToInstance(ApplicationDTO, application);
  }

  @ApiOperation({ summary: 'Récupérer toutes les applications' })
  @ApiResponse({ description: 'Applications récupérées', status: 201 })
  @Get()
  async findAll(): Promise<ApplicationDTO[]> {
    const applications = await firstValueFrom<ApplicationDTO[]>(
      this.coreService.send('core.application.findAll', {}),
    );
    return applications.map((application) =>
      plainToInstance(ApplicationDTO, application),
    );
  }

  @ApiOperation({ summary: 'Récupérer mes applications' })
  @ApiResponse({ description: 'Applications récupérées', status: 201 })
  @Get('me')
  async findMyApplications(
    @CurrentUser() user: UserDTO,
  ): Promise<ApplicationDTO[]> {
    const applications = await firstValueFrom<ApplicationDTO[]>(
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
  @ApiResponse({ description: 'Application récupérée', status: 201 })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApplicationDTO> {
    const application = await firstValueFrom<ApplicationDTO>(
      this.coreService.send('core.application.findOne', id),
    );
    return plainToInstance(ApplicationDTO, application);
  }

  @ApiOperation({ summary: "Récupérer une application par l'id d'une offre" })
  @ApiResponse({ description: 'Application récupérée', status: 201 })
  @Get('/offer/:id')
  async findByOfferId(
    @Param('id') id: string,
    @CurrentUser() user: UserDTO,
  ): Promise<ApplicationDTO[]> {
    const applications = await firstValueFrom<ApplicationDTO[]>(
      this.coreService.send('core.application.findByOfferId', {
        offerId: id,
        userId: getUserId(user),
      }),
    );
    return applications.map((application) =>
      plainToInstance(ApplicationDTO, application),
    );
  }

  @ApiOperation({ summary: 'Mettre à jour une application' })
  @ApiResponse({ description: 'Application mise à jour', status: 201 })
  @ApiBody({
    schema: {
      properties: {
        files: {
          items: {
            format: 'binary',
            type: 'string',
          },
          type: 'array',
        },
        firstMessage: { type: 'string' },
        status: {
          enum: ['pending', 'reviewed', 'accepted', 'rejected'],
          type: 'string',
        },
      },
      type: 'object',
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @Put(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateApplication(
    @Param('id') id: string,
    @Body() body: UpdateApplicationDTO,
    @CurrentUser() user: UserDTO,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ApplicationDTO> {
    const updateApplication = plainToInstance(UpdateApplication, body);
    const application = await firstValueFrom<ApplicationDTO>(
      this.coreService.send('core.application.update', {
        files: files,
        id: id,
        updateApplication: updateApplication,
        userId: getUserId(user),
      }),
    );
    return plainToInstance(ApplicationDTO, application);
  }

  @ApiOperation({ summary: 'Supprimer une application' })
  @ApiResponse({ description: 'Application supprimée', status: 201 })
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
