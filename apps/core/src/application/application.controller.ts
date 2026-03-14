import { BadRequestException, Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { ApplicationEntity } from '@repo/entities';
import {
  Application,
  ApplicationStatus,
  CreateApplication,
  UpdateApplication,
} from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { firstValueFrom } from 'rxjs';
import { OfferService } from 'src/offer/offer.service';
import { UserService } from 'src/users/user.service';

import { ApplicationService } from './application.service';

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
      files: Express.Multer.File[];
    },
  ): Promise<Application> {
    const user = await this.userService.findByIdOrFail(payload.userId);

    const offer = await this.offerService.findOrFail({
      id: payload.createApplication.offerId,
    });
    this.applicationService.validateUserCanViewOfferApplications(user, offer);
    this.applicationService.validateUserCanApplyToOffer(user, offer);
    const existingApplication = await this.applicationService.findOne({
      offerId: offer.id,
      userId: user.id,
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this offer');
    }

    const applicationData: Partial<ApplicationEntity> = {
      ...payload.createApplication,
      offerId: offer.id,
      status: ApplicationStatus.PENDING,
      userId: user.id,
    };

    if (payload.files && payload.files.length > 0) {
      const uploadedFiles = await Promise.all(
        payload.files.map((file) =>
          firstValueFrom(
            this.fileService.send('file.file.uploadFile', { file }),
          ),
        ),
      );
      applicationData.filesIds = uploadedFiles.map((file) => file.id);
    }

    return await this.applicationService.create(applicationData);
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
      where: { offerId: offer.id },
    });
  }

  @MessagePattern('core.application.update')
  async updateApplication(
    @Payload()
    payload: {
      id: string;
      updateApplication: UpdateApplication;
      userId: string;
      files?: Express.Multer.File[];
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

    const { filesIds, ...updateData } = payload.updateApplication;

    // Begin files logic
    let updatedFilesIds = filesIds || application.filesIds || [];

    if (payload.files && payload.files.length > 0) {
      const uploadedFiles = await Promise.all(
        payload.files.map((file) =>
          firstValueFrom(
            this.fileService.send('file.file.uploadFile', { file }),
          ),
        ),
      );
      const newFileIds = uploadedFiles.map((file) => file.id);
      updatedFilesIds = [...updatedFilesIds, ...newFileIds];
    }
    // End files logic

    await this.applicationService.update(application.id, {
      ...updateData,
      filesIds: updatedFilesIds,
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

    if (application.userId !== payload.userId) {
      throw new BadRequestException(
        'You can only delete your own applications',
      );
    }

    // Delete associated files
    if (application.filesIds.length > 0) {
      console.log('Deleting files associated with application...');
      await Promise.allSettled(
        application.filesIds.map((fileId) =>
          firstValueFrom(
            this.fileService.send('file.file.deleteFile', { id: fileId }),
          ).catch((error) => {
            console.error(`Failed to delete file ${fileId}:`, error);
          }),
        ),
      );
    }

    await this.applicationService.remove(application.id);
    return { success: true };
  }
}
