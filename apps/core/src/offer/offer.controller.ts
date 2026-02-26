import { Controller } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOffer, Offer, UpdateOffer } from '@repo/models';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from 'src/users/user.service';
import { CompanyService } from 'src/company/company.service';
import { CompanyEntity, UserEntity } from '@repo/entities';

@Controller('offer')
export class OfferController {
  constructor(
    private readonly offerService: OfferService,
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
  ) {}

  @MessagePattern('core.offer.create')
  async create(
    @Payload() payload: { userId: string; createOffer: CreateOffer },
  ): Promise<Offer> {
    const user: UserEntity = await this.userService.findByIdOrFail(
      payload.userId,
    );
    let company: CompanyEntity | undefined = undefined;

    if (user.companyId !== undefined) {
      company = await this.companyService.findByIdOrFail(user.companyId);
    }
    const offer = await this.offerService.create({
      ...payload.createOffer,
      company: company,
      companyId: company?.id,
    });

    return offer;
  }

  @MessagePattern('core.offer.find-all')
  async findAll(): Promise<Offer[]> {
    return await this.offerService.findAll({
      relations: ['company'],
    });
  }

  @MessagePattern('core.offer.find-by-company-id')
  async findByCompanyId(@Payload() id: string): Promise<Offer[]> {
    return await this.offerService.findAll({
      where: { companyId: id },
      relations: ['company'],
    });
  }

  @MessagePattern('core.offer.find-one')
  async findOne(@Payload() id: string): Promise<Offer | null> {
    return await this.offerService.findByIdOrFail(id);
  }

  @MessagePattern('core.offer.update')
  async update(
    @Payload() payload: { id: string; updateOffer: UpdateOffer },
  ): Promise<Offer> {
    const offer = await this.offerService.findByIdOrFail(payload.id);
    await this.offerService.update(offer.id, {
      ...payload.updateOffer,
      updatedAt: new Date(),
    });

    return await this.offerService.findByIdOrFail(payload.id);
  }

  @MessagePattern('core.offer.delete')
  async delete(@Payload() id: string): Promise<{ success: boolean }> {
    const offer = await this.offerService.findByIdOrFail(id);
    this.offerService.remove(offer.id);
    return { success: true };
  }
}
