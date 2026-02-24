import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '@repo/entities';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  controllers: [CompanyController],
  exports: [CompanyService],
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  providers: [CompanyService],
})
export class CompanyModule {}
