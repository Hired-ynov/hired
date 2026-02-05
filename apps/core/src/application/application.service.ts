import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserDTO, CreateApplicationDTO, ApplicationDTO } from '@repo/models';
import { ApplicationMapper } from './application.mapper';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Offer } from '../offer/entities/offer.entity';
import { FileService } from '../file/file.service';

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

export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private fileService: FileService,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
    user: UserDto,
    files?: MulterFile[],
  ): Promise<ApplicationDto> {
    const application =
      ApplicationMapper.toApplicationEntityFromCreate(createApplicationDto);

    const userId =
      (user as UserDto & { sub?: number }).sub?.toString() || user.id;
    const userEntity = await this.usersRepository.findOneBy({
      id: userId,
    });
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const offer = await this.offersRepository.findOne({
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

    if (files && files.length > 0) {
      const uploadedFiles = await Promise.all(
        files.map((file) => this.fileService.uploadFile(file)),
      );
      application.filesIds = uploadedFiles.map((file) => file.id);
    }

    application.userId = userEntity.id;
    const saved = await this.applicationsRepository.save(application);

    return ApplicationMapper.toApplicationDto(saved);
  }

  async findAll(): Promise<ApplicationDto[]> {
    const applications = await this.applicationsRepository.find();
    return applications.map((a) => ApplicationMapper.toApplicationDto(a));
  }

  async findOne(id: number): Promise<ApplicationDto> {
    const application = await this.applicationsRepository.findOneBy({
      id: id.toString(),
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return ApplicationMapper.toApplicationDto(application);
  }

  async findByUserId(userId: string): Promise<ApplicationDto[]> {
    const applications = await this.applicationsRepository.find({
      where: { userId },
    });
    return applications.map((a) => ApplicationMapper.toApplicationDto(a));
  }

  async findByOfferId(
    offerId: string,
    user: UserDto,
  ): Promise<ApplicationDto[]> {
    const userId =
      (user as UserDto & { sub?: number }).sub?.toString() || user.id;

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
    return applications.map((a) => ApplicationMapper.toApplicationDto(a));
  }

  async update(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
    user: UserDto,
    files?: MulterFile[],
  ): Promise<ApplicationDto> {
    const existingApplication = await this.applicationsRepository.findOneBy({
      id: id.toString(),
    });

    if (!existingApplication) {
      throw new NotFoundException('Application not found');
    }

    const userId =
      (user as UserDto & { sub?: number }).sub?.toString() || user.id;

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

    return ApplicationMapper.toApplicationDto(
      updatedApplication as Application,
    );
  }

  async remove(id: number, user: UserDto): Promise<void> {
    const application = await this.applicationsRepository.findOneBy({
      id: id.toString(),
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const userId =
      (user as UserDto & { sub?: number }).sub?.toString() || user.id;

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
