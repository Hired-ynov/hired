import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  CreateOffer,
  CreateOfferDTO,
  Offer,
  OfferDTO,
  UpdateOffer,
  UpdateOfferDTO,
  UserDTO,
} from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '@repo/commun';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Controller('offer')
export class OfferController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

  @Post()
  async create(
    @Body() createOfferDto: CreateOfferDTO,
    @CurrentUser() user: UserDTO,
  ): Promise<OfferDTO> {
    const createOffer = plainToInstance(CreateOffer, createOfferDto);
    const offer = (await firstValueFrom(
      this.coreService.send('core.offer.create', {
        userId: user.id,
        createOffer,
      }),
    )) as Offer;
    return plainToInstance(OfferDTO, offer);
  }

  @Get()
  async findAll(): Promise<OfferDTO[]> {
    const offers = (await firstValueFrom(
      this.coreService.send('core.offer.find-all', {}),
    )) as Offer[];
    return offers.map((offer: Offer) => plainToInstance(OfferDTO, offer));
  }

  @Get('company/:id')
  async findByCompanyId(@Param('id') id: string): Promise<OfferDTO[]> {
    const offers = (await firstValueFrom(
      this.coreService.send('core.offer.find-by-company-id', id),
    )) as Offer[];
    return offers.map((offer: Offer) => plainToInstance(OfferDTO, offer));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OfferDTO | null> {
    const offer = (await firstValueFrom(
      this.coreService.send('core.offer.find-one', id),
    )) as Offer;
    return offer ? plainToInstance(OfferDTO, offer) : null;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDTO,
  ): Promise<OfferDTO> {
    const updateOffer = plainToInstance(UpdateOffer, updateOfferDto);
    const offer = (await firstValueFrom(
      this.coreService.send('core.offer.update', { id, updateOffer }),
    )) as Offer;
    return plainToInstance(OfferDTO, offer);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return firstValueFrom(this.coreService.send('core.offer.delete', id));
  }
}
