import { BadRequestException, Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateApplication,
  Application,
  UpdateApplication,
  ApplicationStatus,
} from '@repo/models';
import { firstValueFrom } from 'rxjs';

import { ApplicationService } from './application.service';
import { UserService } from 'src/users/user.service';
import { OfferService } from 'src/offer/offer.service';
import { microservices } from '@repo/rabbitmq-config';

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
    private readonly applicationService: ApplicationService,
    private readonly userService: UserService,
    private readonly offerService: OfferService,
    @Inject(microservices.symbols.FILES_SERVICE)
    private readonly fileService: ClientProxy,
  ) {}

  @MessagePattern('core.application.create')
  async create(
    @Payload()
    payload: {
      createApplication: CreateApplication;
      userId: string;
      files: MulterFile[];
    },
  ): Promise<Application> {
    const user = await this.userService.findByIdOrFail(payload.userId);

    const offer = await this.offerService.findOrFail({
      id: payload.createApplication.offerId,
    });

    this.applicationService.validateUserCanViewOfferApplications(user, offer);

    const existingApplication = await this.applicationService.findOne({
      userId: user.id,
      offerId: payload.createApplication.offerId,
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this offer');
    }

    const applicationData: any = {
      ...payload.createApplication,
      status: ApplicationStatus.PENDING,
      userId: user.id,
    };

    if (payload.files && payload.files.length > 0) {
      const uploadedFiles = await Promise.all(
        payload.files.map((file) =>
          firstValueFrom(this.fileService.send('file.file.uploadFile', file)),
        ),
      );
      applicationData.filesIds = uploadedFiles.map((file) => file.id);
    }

    const saved = await this.applicationService.create(applicationData);
    return saved;
  }

  @MessagePattern('core.application.findAll')
  async findAll(): Promise<Application[]> {
    return await this.applicationService.findAll();
  }

  @MessagePattern('core.application.findMyApplications')
  async findMyApplications(@Payload() userId: string): Promise<Application[]> {
    return await this.applicationService.findAll({
      where: { userId: userId },
    });
  }

  @MessagePattern('core.application.findOne')
  async findOne(@Payload() id: string): Promise<Application> {
    return await this.applicationService.findByIdOrFail(id);
  }

  @MessagePattern('core.application.findByOfferId')
  async findByOfferId(
    @Payload() payload: { offerId: string; userId: string },
  ): Promise<Application[]> {
    const user = await this.userService.findByIdOrFail(payload.userId);
    const offer = await this.offerService.findOrFail({
      id: payload.offerId,
    });

    this.applicationService.validateUserCanViewOfferApplications(user, offer);

    return this.applicationService.findAll({
      where: { offerId: payload.offerId },
    });
  }

  @MessagePattern('core.application.update')
  async updateApplication(
    @Payload()
    payload: {
      id: string;
      updateApplication: UpdateApplication;
      userId: string;
      files: MulterFile[];
    },
  ): Promise<Application> {
    const user = await this.userService.findByIdOrFail(payload.userId);
    const application = await this.applicationService.findByIdOrFail(
      payload.id,
    );
    const offer = await this.offerService.findOrFail({
      id: application.offerId,
    });

    this.applicationService.validateUserCanUpdateApplication(
      user,
      application,
      offer,
    );

    await this.applicationService.update(payload.id, {
      ...payload.updateApplication,
      updatedAt: new Date(),
    });

    return await this.applicationService.findByIdOrFail(payload.id);
  }

  @MessagePattern('core.application.delete')
  async remove(
    @Payload() payload: { id: string; userId: string },
  ): Promise<{ success: boolean }> {
    const application = await this.applicationService.findByIdOrFail(
      payload.id,
    );

    if (application.userId.toString() !== payload.userId) {
      throw new BadRequestException(
        'You can only delete your own applications',
      );
    }
    this.applicationService.remove(payload.id);
    return { success: true };
  }
}
