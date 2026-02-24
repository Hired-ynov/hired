import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CompanyEntity } from '@repo/entities';
import {
  UpdateCompanyDTO,
  UserDTO,
  CreateCompanyDTO,
  Company,
} from '@repo/models';
import { plainToInstance } from 'class-transformer';

import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @MessagePattern('company.create')
  create(
    @Payload() payload: { createCompanyDto: CreateCompanyDTO; user: UserDTO },
  ): Promise<Company> {
    const userId =
      (payload.user as UserDTO & { sub?: number }).sub?.toString() ||
      payload.user.id;

    return this.companyService.createCompany(payload.createCompanyDto, userId);
  }

  @MessagePattern('company.findAll')
  findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @MessagePattern('company.findOne')
  async findOne(@Payload() id: string): Promise<CompanyEntity | null> {
    return await this.companyService.findOne({ id: id });
  }

  @MessagePattern('company.update')
  update(
    @Payload()
    payload: {
      id: string;
      updateCompanyDto: UpdateCompanyDTO;
    },
  ): Promise<CompanyEntity | null> {
    const company = plainToInstance(CompanyEntity, payload.updateCompanyDto);
    return this.companyService.updateCompany(+payload.id, company);
  }

  @MessagePattern('company.delete')
  delete(@Payload() payload: { id: string }): Promise<void> {
    return this.companyService.remove(payload.id);
  }
}
