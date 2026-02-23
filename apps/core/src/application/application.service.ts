import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserDTO, CreateApplicationDTO, ApplicationDTO } from '@repo/models';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationEntity } from './entities/application.entity';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@repo/nest-service';
import { OfferService } from '../offer/offer.service';
import { OfferEntity } from '../offer/entities/offer.entity';
import { UserEntity } from '../users/entities/user.entity';

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

export class ApplicationService extends BaseService<ApplicationEntity> {
  constructor(
    @InjectRepository(ApplicationEntity)
    private applicationsRepository: Repository<ApplicationEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<User>,
    @InjectRepository(OfferEntity)
    private offersRepository: Repository<OfferEntity>,
    private fileService: FileService,
    private readonly offerService: OfferService,
  ) {
    super(applicationsRepository);
  }

  async createApplication(
    createApplicationDto: CreateApplicationDTO,
    user: UserDTO,
    files?: MulterFile[],
  ): Promise<ApplicationDTO> {
    const application = plainToInstance(
      ApplicationEntity,
      createApplicationDto,
    );

    const userId =
      (user as UserDTO & { sub?: number }).sub?.toString() || user.id;
    const userEntity = await this.userService.findOne({
      id: userId,
    });
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const offer = await this.offerService.findOne({
      where: { id: createApplicationDto.offerId },
      relations: ['company'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (
      userEntity.companyId &&
      userEntity.companyId.toString() === offer.companyId.toString()
    ) {
      throw new BadRequestException(
        'You cannot apply to an offer from your own company',
      );
    }

    const existingApplication = await this.applicationsRepository.findOne({
      where: {
        userId: userEntity.id,
        offerId: createApplicationDto.offerId,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this offer');
    }

    const applicationData: any = {
      ...createApplicationDto,
      userId: userEntity.id,
    };

    // if (files && files.length > 0) {
    //   const uploadedFiles = await Promise.all(
    //     files.map((file) => this.fileService.uploadFile(file)),
    //   );
    //   application.filesIds = uploadedFiles.map((file) => file.id);
    // }

    return applicationData;
  }

  async findByUserId(userId: string): Promise<ApplicationDTO[]> {
    const applications = await this.applicationsRepository.find({
      where: { userId },
    });
    return applications;
  }

  async findByOfferId(
    offerId: string,
    user: UserDTO,
  ): Promise<ApplicationDTO[]> {
    const userId =
      (user as UserDTO & { sub?: number }).sub?.toString() || user.id;

    const userEntity = await this.usersRepository.findOneBy({
      id: userId,
    });

    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const offer = await this.offersRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (
      !userEntity.companyId ||
      offer.companyId.toString() !== userEntity.companyId.toString()
    ) {
      throw new BadRequestException(
        'You can only view applications for your company offers',
      );
    }

    const applications = await this.applicationsRepository.find({
      where: { offerId },
    });
    return applications.map((a) => plainToInstance(ApplicationDTO, a));
  }

  async updateApplication(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
    user: UserDTO,
    files?: MulterFile[],
  ): Promise<ApplicationDTO> {
    const existingApplication = await this.applicationsRepository.findOneBy({
      id: id.toString(),
    });

    if (!existingApplication) {
      throw new NotFoundException('Application not found');
    }

    const userId =
      (user as UserDTO & { sub?: number }).sub?.toString() || user.id;

    const userEntity = await this.usersRepository.findOneBy({
      id: userId,
    });

    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    // Vérifier si l'utilisateur est le propriétaire de l'application
    const isApplicationOwner =
      existingApplication.userId.toString() === userId.toString();

    // Vérifier si l'utilisateur appartient à la company qui a créé l'offre
    const offer = await this.offersRepository.findOne({
      where: { id: existingApplication.offerId },
    });

    const isCompanyOwner =
      userEntity.companyId &&
      offer?.companyId.toString() === userEntity.companyId.toString();

    if (!isApplicationOwner && !isCompanyOwner) {
      throw new BadRequestException(
        'You can only update applications you own or applications for your company offers',
      );
    }

    // Upload new files if provided
    if (files && files.length > 0) {
      const uploadedFiles = await Promise.all(
        files.map((file) => this.fileService.uploadFile(file)),
      );
      const newFileIds = uploadedFiles.map((file) => file.id);
      const existingFileIds = existingApplication.filesIds || [];
      updateApplicationDto.filesIds = [...existingFileIds, ...newFileIds];
    }

    await this.applicationsRepository.update(id.toString(), {
      ...updateApplicationDto,
      updatedAt: new Date(),
    });

    const updatedApplication = await this.applicationsRepository.findOneBy({
      id: id.toString(),
    });

    return plainToInstance(ApplicationDTO, updatedApplication);
  }

  async removeApplication(id: number, user: UserDTO): Promise<void> {
    const application = await this.applicationsRepository.findOneBy({
      id: id.toString(),
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const userId =
      (user as UserDTO & { sub?: number }).sub?.toString() || user.id;

    if (application.userId.toString() !== userId.toString()) {
      throw new BadRequestException(
        'You can only delete your own applications',
      );
    }

    // Delete associated files in cascade
    if (application.filesIds && application.filesIds.length > 0) {
      await Promise.all(
        application.filesIds.map((fileId) =>
          this.fileService.deleteFile(fileId),
        ),
      );
    }

    await this.applicationsRepository.delete(id.toString());
  }
}
