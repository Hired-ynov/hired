import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateApplicationDTO } from '@repo/models';
import { ApplicationService } from './application.service';

import { CurrentUser } from '../auth/current-user.decorator';
import { Role, UserDto } from '@hired4/domain-objects';
import { ApplicationDto } from './dto/application.dto';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { UpdateApplicationDto } from './dto/update-application.dto';

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
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() body: CreateApplicationDTO,
    @CurrentUser() user: UserDto,
    @UploadedFiles() files?: MulterFile[],
  ): Promise<ApplicationDto> {
    return this.applicationService.create(body, user, files);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(Role.admin)
  findAll(): Promise<ApplicationDto[]> {
    return this.applicationService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  findMyApplications(@CurrentUser() user: UserDto): Promise<ApplicationDto[]> {
    const userId =
      (user as UserDto & { sub?: number }).sub?.toString() || user.id;
    return this.applicationService.findByUserId(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string): Promise<ApplicationDto> {
    return this.applicationService.findOne(+id);
  }

  @Get('/offer/:id')
  @UseGuards(AuthGuard)
  findByOfferId(
    @Param('id') id: string,
    @CurrentUser() user: UserDto,
  ): Promise<ApplicationDto[]> {
    return this.applicationService.findByOfferId(id, user);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateApplicationDto,
    @CurrentUser() user: UserDto,
    @UploadedFiles() files?: MulterFile[],
  ): Promise<ApplicationDto> {
    return this.applicationService.update(+id, body, user, files);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: UserDto): Promise<void> {
    return this.applicationService.remove(+id, user);
  }
}
