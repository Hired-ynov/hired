import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { CompanyService } from './company.service';
import {
  UpdateCompanyDTO,
  UserDTO,
  CreateCompanyDTO,
  CompanyDTO,
} from '@repo/models';
import { plainToInstance } from 'class-transformer';
import { CompanyEntity } from './entities/company.entity';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  //@UseGuards(AuthGuard)
  create(
    @Body() createCompanyDto: CreateCompanyDTO,
    @CurrentUser() user: UserDTO,
  ): Promise<CompanyDTO> {
    const company = plainToInstance(CompanyEntity, createCompanyDto);
    const userId =
      (user as UserDTO & { sub?: number }).sub?.toString() || user.id;

    return this.companyService.createCompany(company, userId);
  }

  @Get()
  //@Roles(Role.admin)
  findAll(): Promise<CompanyDTO[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CompanyDTO> {
    return await plainToInstance(
      CompanyDTO,
      this.companyService.findOne({ id: id }),
    );
  }

  @Put(':id')
  //@UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDTO,
  ): Promise<CompanyDTO> {
    const company = plainToInstance(CompanyEntity, updateCompanyDto);
    return this.companyService.updateCompany(+id, company);
  }

  @Delete(':id')
  //@UseGuards(AuthGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.companyService.remove(id);
  }
}
