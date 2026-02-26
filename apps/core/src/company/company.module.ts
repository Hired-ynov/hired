import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyEntity, UserEntity } from '@repo/entities';

@Module({
  controllers: [CompanyController],
  exports: [CompanyService],
  imports: [TypeOrmModule.forFeature([CompanyEntity, UserEntity])],
  providers: [CompanyService],
})
export class CompanyModule {}
