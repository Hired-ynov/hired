import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProvider, ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity } from '@repo/entities';
import { microservices } from '@repo/rabbitmq-config';
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
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: microservices.symbols.FILES_SERVICE,
        useFactory: (configService: ConfigService) => {
          return microservices.FILES_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          }) as unknown as ClientProvider;
        },
      },
    ]),
  ],
  providers: [ApplicationService],
})
export class ApplicationModule {}
