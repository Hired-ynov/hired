import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity, UserEntity } from '@repo/entities';
import { Company, CreateCompanyDTO, User } from '@repo/models';
import { BaseService } from '@repo/nest-service';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService extends BaseService<CompanyEntity> {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companiesRepository: Repository<CompanyEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<User>,
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
    id: string,
    company: CompanyEntity,
  ): Promise<CompanyEntity | null> {
    const existingCompany = await this.companiesRepository.findOneBy({
      id: id,
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    await this.companiesRepository.update(id, {
      description: company.description,
      name: company.name,
      updatedAt: new Date(),
    });

    const updatedCompany = await this.companiesRepository.findOneBy({
      id: id,
    });

    return updatedCompany;
  }
}
