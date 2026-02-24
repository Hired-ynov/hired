import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company, CompanyDTO, CreateCompanyDTO, User } from '@repo/models';
import { BaseService } from '@repo/nest-service';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { CompanyEntity, UserEntity } from '@repo/entities';

@Injectable()
export class CompanyService extends BaseService<CompanyEntity> {
  constructor(
    @InjectRepository(CompanyEntity)
    private companiesRepository: Repository<CompanyEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<User>,
  ) {
    super(companiesRepository);
  }

  async createCompany(
    company: CreateCompanyDTO,
    userId: string,
  ): Promise<Company> {
    const savedCompany = await this.companiesRepository.save(company);

    const userEntity = await this.usersRepository.findOneBy({ id: userId });
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    userEntity.companyId = savedCompany.id;
    await this.usersRepository.save(userEntity);

    return savedCompany;
  }

  async updateCompany(
    id: number,
    company: CompanyEntity,
  ): Promise<CompanyEntity | null> {
    const existingCompany = await this.companiesRepository.findOneBy({
      id: id.toString(),
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    await this.companiesRepository.update(id.toString(), {
      ...company,
      updatedAt: new Date(),
    });

    const updatedCompany = await this.companiesRepository.findOneBy({
      id: id.toString(),
    });

    return updatedCompany;
  }
}
