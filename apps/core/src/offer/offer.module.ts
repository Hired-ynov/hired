import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferEntity } from '@repo/entities';

import { CompanyModule } from '../company/company.module';
import { UserModule } from '../users/user.module';

import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';

@Module({
  controllers: [OfferController],
  exports: [OfferService],
  imports: [TypeOrmModule.forFeature([OfferEntity]), UserModule, CompanyModule],
  providers: [OfferService],
})
export class OfferModule {}
