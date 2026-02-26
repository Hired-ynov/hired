import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDTO, ApplicationDTO, User, Offer } from '@repo/models';

import { BadRequestException, NotFoundException } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { BaseService } from '@repo/nest-service';
import { OfferService } from '../offer/offer.service';

import { ApplicationEntity, OfferEntity, UserEntity } from '@repo/entities';

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
  ) {
    super(applicationsRepository);
  }

  /**
   * Vérifie si l'utilisateur peut voir les applications d'une offre
   * Lance une exception si l'utilisateur n'est pas propriétaire de la company de l'offre
   */
  validateUserCanViewOfferApplications(user: User, offer: Offer): void {
    if (
      !user.companyId ||
      offer.companyId.toString() !== user.companyId.toString()
    ) {
      throw new BadRequestException(
        'You can only view applications for your company offers',
      );
    }
  }

  /**
   * Vérifie si l'utilisateur peut modifier une application
   * L'utilisateur peut modifier si :
   * - Il est le propriétaire de l'application (candidat)
   * - Il appartient à la company qui a créé l'offre (recruteur)
   */
  validateUserCanUpdateApplication(
    user: UserEntity,
    application: ApplicationEntity,
    offer: Offer,
  ): void {
    const isApplicationOwner =
      application.userId.toString() === user.id.toString();

    const isCompanyOwner =
      user.companyId &&
      offer.companyId.toString() === user.companyId.toString();

    if (!isApplicationOwner && !isCompanyOwner) {
      throw new BadRequestException(
        'You can only update applications you own or applications for your company offers',
      );
    }
  }
}
