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
import { CurrentUser, Public, Roles } from '@repo/commun';
import {
  UserDTO,
  CompanyDTO,
  UpdateCompanyDTO,
  Role,
  CreateCompanyDTO,
} from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Créer une entreprise' })
  @ApiResponse({ description: 'Entreprise créée', status: 201 })
  @Post()
  async create(
    @Body() createCompanyDto: CreateCompanyDTO,
    @CurrentUser() user: UserDTO,
  ): Promise<CompanyDTO> {
    const newCompany = await firstValueFrom<CompanyDTO>(
      this.coreService.send('company.create', {
        createCompanyDto: createCompanyDto,
        user: user,
      }),
    );

    return plainToInstance(CompanyDTO, newCompany);
  }

  @ApiOperation({ summary: 'Récupérer toutes les entreprises' })
  @ApiResponse({ description: 'Entreprises récupérées', status: 201 })
  @Get('all')
  @Roles(Role.admin)
  async findAll(): Promise<CompanyDTO[]> {
    const companies = await firstValueFrom<CompanyDTO[]>(
      this.coreService.send('company.findAll', {}),
    );
    return companies.map((company) => plainToInstance(CompanyDTO, company));
  }

  @ApiOperation({ summary: 'Récupérer une entreprise' })
  @ApiResponse({ description: 'Entreprise récupérée', status: 201 })
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<CompanyDTO> {
    const company = await firstValueFrom<CompanyDTO>(
      this.coreService.send('company.findOne', { id: id }),
    );
    return plainToInstance(CompanyDTO, company);
  }

  @ApiOperation({ summary: 'Mettre à jour une entreprise' })
  @ApiResponse({ description: 'Entreprise mise à jour', status: 201 })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDTO,
  ): Promise<CompanyDTO> {
    const company = await firstValueFrom<CompanyDTO>(
      this.coreService.send('company.update', {
        id: id,
        updateCompanyDto: updateCompanyDto,
      }),
    );

    return plainToInstance(CompanyDTO, company);
  }

  @ApiOperation({ summary: 'Supprimer une entreprise' })
  @ApiResponse({ description: 'Entreprise supprimée', status: 201 })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await firstValueFrom(this.coreService.send('company.delete', { id }));
  }
}
