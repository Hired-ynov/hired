import { Controller, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  UpdateCompanyDTO,
  UserDTO,
  CreateCompanyDTO,
  CompanyDTO,
} from '@repo/models';
import { plainToInstance } from 'class-transformer';

import { CompanyService } from './company.service';
import { CompanyEntity } from './entities/company.entity';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @MessagePattern('company.create')
  create(
    @Payload() payload: { createCompanyDto: CreateCompanyDTO; user: UserDTO },
  ): Promise<CompanyDTO> {
    const company = plainToInstance(CompanyEntity, payload.createCompanyDto);
    const userId =
      (payload.user as UserDTO & { sub?: number }).sub?.toString() ||
      payload.user.id;

    return this.companyService.createCompany(company, userId);
  }

  @MessagePattern('company.findAll')
  findAll(): Promise<CompanyDTO[]> {
    return this.companyService.findAll();
  }

  @MessagePattern('company.findOne')
  async findOne(@Payload() id: string): Promise<CompanyDTO> {
    return plainToInstance(CompanyDTO, this.companyService.findOne({ id: id }));
  }

  @MessagePattern('company.update')
  update(
    @Payload()
    payload: {
      id: string;
      updateCompanyDto: UpdateCompanyDTO;
    },
  ): Promise<CompanyDTO> {
    const company = plainToInstance(CompanyEntity, payload.updateCompanyDto);
    return this.companyService.updateCompany(+payload.id, company);
  }

  @MessagePattern('company.delete')
  delete(@Param('id') id: string): Promise<void> {
    return this.companyService.remove(id);
  }
}
