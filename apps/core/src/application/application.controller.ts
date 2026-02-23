import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserDTO, CreateApplicationDTO, ApplicationDTO } from '@repo/models';
import { plainToInstance } from 'class-transformer';

import { ApplicationService } from './application.service';
import { ApplicationEntity } from './entities/application.entity';

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

  @MessagePattern('core.application.create')
  async create(
    @Payload()
    payload: {
      createApplication: CreateApplicationDTO;
      user: UserDTO;
      files: MulterFile[];
    },
  ): Promise<ApplicationDTO> {
    const applicationData = await this.applicationService.createApplication(
      payload.createApplication,
      payload.user,
      payload.files,
    );
    const saved = await this.applicationService.create(applicationData);
    return plainToInstance(ApplicationDTO, saved);
  }

  @MessagePattern('core.application.findAll')
  async findAll(): Promise<ApplicationDTO[]> {
    var applications = await this.applicationService.findAll();
    return applications.map((a) => plainToInstance(ApplicationEntity, a));
  }

  @MessagePattern('core.application.findMyApplications')
  async findMyApplications(
    @Payload() user: UserDTO,
  ): Promise<ApplicationDTO[]> {
    const userId =
      (user as UserDTO & { sub?: number }).sub?.toString() || user.id;
    const applications = await this.applicationService.findByUserId(userId);
    return applications.map((a) => plainToInstance(ApplicationDTO, a));
  }

  @MessagePattern('core.application.findOne')
  async findOne(@Payload() id: string): Promise<ApplicationDTO> {
    return await plainToInstance(
      ApplicationEntity,
      this.applicationService.findOne({ id: id }),
    );
  }

  @MessagePattern('core.application.findByOfferId')
  findByOfferId(
    @Payload() payload: { id: string; user: UserDTO },
  ): Promise<ApplicationDTO[]> {
    return this.applicationService.findByOfferId(payload.id, payload.user);
  }

  @MessagePattern('core.application.update')
  async updateApplication(
    @Payload() payload: { id; body; user; files },
  ): Promise<ApplicationDTO> {
    return this.applicationService.updateApplication(
      +payload.id,
      payload.body,
      payload.user,
      payload.files,
    );
  }

  @MessagePattern('core.application.delete')
  remove(@Payload() payload: { id: string; user: UserDTO }): Promise<void> {
    return this.applicationService.removeApplication(+payload.id, payload.user);
  }
}
