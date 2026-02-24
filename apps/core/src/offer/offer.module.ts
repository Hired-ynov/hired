import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { OfferEntity } from '@repo/entities';
import { UserModule } from '../users/user.module';
import { CompanyModule } from '../company/company.module';

@Module({
  controllers: [OfferController],
  exports: [OfferService],
  imports: [TypeOrmModule.forFeature([OfferEntity]), UserModule, CompanyModule],
  providers: [OfferService],
})
export class OfferModule {}
