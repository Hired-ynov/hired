import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationEntity } from '@repo/entities';
import { OfferModule } from 'src/offer/offer.module';
import { UserModule } from 'src/users/user.module';

import { microservices } from '@repo/rabbitmq-config';

@Module({
  controllers: [ApplicationController],
  exports: [ApplicationService],
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity]),
    UserModule,
    OfferModule,
    ClientsModule.registerAsync([
      {
        name: microservices.symbols.FILES_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return microservices.FILES_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ApplicationService],
})
export class ApplicationModule {}
