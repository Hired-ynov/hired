import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Injectable,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser, Roles } from '@repo/commun';
import {
  UserDTO,
  CompanyDTO,
  UpdateCompanyDTO,
  Role,
  CreateCompanyDTO,
  Company,
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
    const newCompany = (await firstValueFrom(
      this.coreService.send('company.create', {
        createCompanyDto: createCompanyDto,
        user: user,
      }),
    )) as Company;

    return plainToInstance(CompanyDTO, newCompany);
  }

  @Get('all')
  @Roles(Role.admin)
  async findAll(): Promise<CompanyDTO[]> {
    const companies = (await firstValueFrom(
      this.coreService.send('company.findAll', {}),
    )) as Company[];
    return companies.map((company) => plainToInstance(CompanyDTO, company));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CompanyDTO> {
    const company = (await firstValueFrom(
      this.coreService.send('company.findOne', { id: id }),
    )) as Company;
    return plainToInstance(CompanyDTO, company);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDTO,
  ): Promise<CompanyDTO> {
    const company = (await firstValueFrom(
      this.coreService.send('company.update', {
        id: id,
        updateCompanyDto: updateCompanyDto,
      }),
    )) as Company;

    return plainToInstance(CompanyDTO, company);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await firstValueFrom(this.coreService.send('company.delete', { id }));
  }
}
