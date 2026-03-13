import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity } from '@repo/entities';
import { OfferModule } from 'src/offer/offer.module';
import { UserModule } from 'src/users/user.module';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

@Module({
  controllers: [ApplicationController],
  exports: [ApplicationService],
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity]),
    UserModule,
    OfferModule,
  ],
  providers: [ApplicationService],
})
export class ApplicationModule {}
