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

@Controller('company')
export class CompanyController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

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

  @Get('all')
  @Roles(Role.admin)
  async findAll(): Promise<CompanyDTO[]> {
    const companies = await firstValueFrom<CompanyDTO[]>(
      this.coreService.send('company.findAll', {}),
    );
    return companies.map((company) => plainToInstance(CompanyDTO, company));
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<CompanyDTO> {
    const company = await firstValueFrom<CompanyDTO>(
      this.coreService.send('company.findOne', { id: id }),
    );
    return plainToInstance(CompanyDTO, company);
  }

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

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await firstValueFrom(this.coreService.send('company.delete', { id }));
  }
}
