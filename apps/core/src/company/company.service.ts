import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyDTO, User } from '@repo/models';
import { BaseService } from '@repo/nest-service';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { CompanyEntity } from './entities/company.entity';
import { UserEntity } from '../users/entities/user.entity';

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
    company: CompanyEntity,
    userId: string,
  ): Promise<CompanyDTO> {
    const saved = await this.companiesRepository.save(company);

    const userEntity = await this.usersRepository.findOneBy({ id: userId });
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    userEntity.companyId = saved.id;
    await this.usersRepository.save(userEntity);

    return plainToInstance(CompanyDTO, saved);
  }

  async updateCompany(id: number, company: CompanyEntity): Promise<CompanyDTO> {
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

    return plainToInstance(CompanyDTO, updatedCompany);
  }
}
