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
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '@repo/commun';
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
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { getUserId } from 'src/utils/user-id.utils';

@ApiTags('offer')
@Controller('offer')
export class OfferController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Créer une offre' })
  @ApiResponse({ description: 'Offre créée', status: 201 })
  @Post()
  async create(
    @Body() createOfferDto: CreateOfferDTO,
    @CurrentUser() user: UserDTO,
  ): Promise<OfferDTO> {
    const createOffer = plainToInstance(CreateOffer, createOfferDto);
    const offer = await firstValueFrom<Offer>(
      this.coreService.send('core.offer.create', {
        createOffer: createOffer,
        userId: getUserId(user),
      }),
    );
    return plainToInstance(OfferDTO, offer);
  }

  @ApiOperation({ summary: 'Récupérer toutes les offres' })
  @ApiResponse({ description: 'Offres réucpérées', status: 201 })
  @Get()
  @Public()
  async findAll(): Promise<OfferDTO[]> {
    const offers = await firstValueFrom<Offer[]>(
      this.coreService.send('core.offer.find-all', {}),
    );
    return offers.map((offer: Offer) => plainToInstance(OfferDTO, offer));
  }

  @ApiOperation({ summary: "Récupérer les offres par l'id d'une entreprise" })
  @ApiResponse({ description: 'Offres récupérées', status: 201 })
  @Get('company/:id')
  @Public()
  async findByCompanyId(@Param('id') id: string): Promise<OfferDTO[]> {
    const offers = await firstValueFrom<Offer[]>(
      this.coreService.send('core.offer.find-by-company-id', id),
    );
    return offers.map((offer: Offer) => plainToInstance(OfferDTO, offer));
  }

  @ApiOperation({ summary: 'Récupérer une offre' })
  @ApiResponse({ description: 'Offre récupérée', status: 201 })
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<OfferDTO | null> {
    const offer = await firstValueFrom<Offer | null>(
      this.coreService.send('core.offer.find-one', id),
    );
    return offer ? plainToInstance(OfferDTO, offer) : null;
  }

  @ApiOperation({ summary: 'Mettre à jour une offre' })
  @ApiResponse({ description: 'Offre mise à jour', status: 201 })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDTO,
  ): Promise<OfferDTO> {
    const updateOffer = plainToInstance(UpdateOffer, updateOfferDto);
    const offer = await firstValueFrom<Offer>(
      this.coreService.send('core.offer.update', { id, updateOffer }),
    );
    return plainToInstance(OfferDTO, offer);
  }

  @ApiOperation({ summary: 'Supprimer une offre' })
  @ApiResponse({ description: 'Offre supprimée', status: 201 })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return firstValueFrom(this.coreService.send('core.offer.delete', id));
  }
}
