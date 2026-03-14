import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationEntity, UserEntity } from '@repo/entities';
import { User, Offer } from '@repo/models';
import { BaseService } from '@repo/nest-service';
import { Repository } from 'typeorm';

export class ApplicationService extends BaseService<ApplicationEntity> {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationsRepository: Repository<ApplicationEntity>,
  ) {
    super(applicationsRepository);
  }

  /**
   * Vérifie si l'utilisateur peut voir les applications d'une offre
   * Lance une exception si l'utilisateur n'est pas propriétaire de la company de l'offre
   */
  validateUserCanViewOfferApplications(user: User, offer: Offer): void {
    if (offer.companyId !== user.companyId) {
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
    const isApplicationOwner = application.userId === user.id;

    const isCompanyOwner = offer.companyId === user.companyId;

    if (!isApplicationOwner && !isCompanyOwner) {
      throw new BadRequestException(
        'You can only update applications you own or applications for your company offers',
      );
    }
  }

  /**
   * Vérifie si l'utilisateur peut postuler à une offre
   * L'utilisateur peut postuler si :
   * - Il n'appartient pas à la company qui a créé l'offre (recruteur)
   */
  validateUserCanApplyToOffer(user: UserEntity, offer: Offer): void {
    const isCompanyOwner = offer.companyId === user.companyId;

    if (isCompanyOwner) {
      throw new BadRequestException(
        'You cant apply to offers from your company',
      );
    }
  }
}
