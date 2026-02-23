import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  CreateOfferDTO,
  OfferDTO,
  UpdateOfferDTO,
  UserDTO,
} from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { ClientProxy } from '@nestjs/microservices';

@Controller('offer')
export class OfferController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async create(
    @Body() createOfferDto: CreateOfferDTO,
    @CurrentUser() user: UserDTO,
  ): Promise<OfferDTO> {
    return await this.coreService.send('core.offer.create', {
      createOfferDto,
      user,
    });
  }

  @Get()
  async findAll(): Promise<OfferDTO[]> {
    return await this.coreService.send('core.offer.findAll', {});
  }

  @Get('company/:id')
  async findByCompanyId(@Param('id') id: string): Promise<OfferDTO[]> {
    return this.coreService.send('core.offer.findByCompanyId', id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OfferDTO | null> {
    return this.coreService.send('core.offer.findOne', +id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDTO,
  ): Promise<OfferDTO> {
    return this.coreService.send('core.offer.update', {
      id: +id,
      updateOfferDto,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string): Promise<void> {
    return this.coreService.send('core.offer.delete', id);
  }
}
