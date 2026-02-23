import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OfferEntity } from './entities/offer.entity';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';

@Module({
  controllers: [OfferController],
  exports: [OfferService],
  imports: [TypeOrmModule.forFeature([OfferEntity])],
  providers: [OfferService],
})
export class OfferModule {}
