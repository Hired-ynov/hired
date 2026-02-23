import { Controller } from '@nestjs/common';
import { OfferService } from './offer.service';
import { plainToInstance } from 'class-transformer';
import { OfferEntity } from './entities/offer.entity';
import {
  CreateOfferDTO,
  OfferDTO,
  UpdateOfferDTO,
  UserDTO,
} from '@repo/models';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @MessagePattern('core.offer.create')
  async create(
    @Payload() payload: { user: UserDTO; createOfferDto: CreateOfferDTO },
  ): Promise<OfferDTO> {
    const offer = plainToInstance(OfferEntity, payload.createOfferDto);
    const userId =
      (payload.user as UserDTO & { sub?: number }).sub?.toString() ||
      payload.user.id;
    offer.companyId = userId;

    const response = await this.offerService.create(offer, payload.user);
    return plainToInstance(OfferDTO, response);
  }

  @MessagePattern('core.offer.findAll')
  async findAll(): Promise<OfferDTO[]> {
    const offers = await this.offerService.findAll();
    return offers.map((offer) => plainToInstance(OfferDTO, offer));
  }

  @MessagePattern('core.offer.findByCompanyId')
  async findByCompanyId(@Payload() id: string): Promise<OfferDTO[]> {
    const offers = await this.offerService.findByCompanyId(id);
    return offers.map((offer) => plainToInstance(OfferDTO, offer));
  }

  @MessagePattern('core.offer.findOne')
  async findOne(@Payload() id: string): Promise<OfferDTO | null> {
    const offer = await this.offerService.findOne(+id);
    return plainToInstance(OfferDTO || null, offer);
  }

  @MessagePattern('core.offer.update')
  async update(
    @Payload() payload: { id: string; updateOfferDto: UpdateOfferDTO },
  ): Promise<OfferDTO> {
    const offer = this.offerService.update(+payload.id, payload.updateOfferDto);
    return plainToInstance(OfferDTO, offer);
  }

  @MessagePattern('core.offer.delete')
  async delete(@Payload() id: string): Promise<void> {
    return this.offerService.remove(+id);
  }
}
