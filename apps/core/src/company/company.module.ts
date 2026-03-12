import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity, UserEntity } from '@repo/entities';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  controllers: [CompanyController],
  exports: [CompanyService],
  imports: [TypeOrmModule.forFeature([CompanyEntity, UserEntity])],
  providers: [CompanyService],
})
export class CompanyModule {}
