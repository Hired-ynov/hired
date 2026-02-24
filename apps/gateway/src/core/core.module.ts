import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';
import { CompanyController } from './company/company.controller';
import { OfferController } from './offer/offer.controller';
import { ApplicationController } from './application/application.controller';

import { CoreController } from './core.controller';
import { UserController } from './user/user.controller';

@Module({
  controllers: [
    CoreController,
    UserController,
    CompanyController,
    OfferController,
    ApplicationController,
  ],
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: microservices.symbols.CORE_SERVICE,
        useFactory: (configService: ConfigService) => {
          return microservices.CORE_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
      },
    ]),
  ],
})
export class CoreModule {}
