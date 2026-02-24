import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationEntity } from '@repo/entities';
import { UserModule } from 'src/users/user.module';
import { OfferModule } from 'src/offer/offer.module';

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
