import {
  Body,
  Delete,
  Get,
  Inject,
  Injectable,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { microservices } from '@repo/rabbitmq-config';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateOfferDTO,
  UserDTO,
  CompanyDTO,
  UpdateCompanyDTO,
} from '@repo/models';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CompanyController {
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
  ): Promise<CompanyDTO> {
    return this.coreService.send('company.create', {
      createOfferDto: createOfferDto,
      user: user,
    });
  }

  @Get()
  //@Roles(Role.admin)
  findAll(): Promise<CompanyDTO[]> {
    return this.coreService.send('company.findAll', {});
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CompanyDTO> {
    return this.coreService.send('company.findOne', { id: id });
  }

  @Put(':id')
  //@UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDTO,
  ): Promise<CompanyDTO> {
    return this.coreService.send('company.update', {
      id: +id,
      updateCompanyDto,
    });
  }

  @Delete(':id')
  //@UseGuards(AuthGuard)
  remove(@Param('id') id: string): Promise<void> {
    this.coreService.send('company.delete', id);
  }
}
