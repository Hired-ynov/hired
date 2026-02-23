import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyEntity } from './entities/company.entity';

@Module({
  controllers: [CompanyController],
  exports: [CompanyService],
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  providers: [CompanyService],
})
export class CompanyModule {}
