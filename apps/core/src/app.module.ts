import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserEntity,
  CompanyEntity,
  ApplicationEntity,
  OfferEntity,
} from '@repo/entities';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationModule } from './application/application.module';
import { CompanyModule } from './company/company.module';
import { OfferModule } from './offer/offer.module';
import { UserModule } from './users/user.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        database: configService.get('POSTGRES_DB'),
        entities: [CompanyEntity, ApplicationEntity, UserEntity, OfferEntity],
        host: configService.get('POSTGRES_HOST'),
        password: configService.get('POSTGRES_PASSWORD'),
        port: configService.get<number>('POSTGRES_PORT'),
        synchronize: configService.get('NODE_ENV') !== 'production',
        type: 'postgres',
        username: configService.get('POSTGRES_USER'),
      }),
    }),
    TypeOrmModule.forFeature([
      CompanyEntity,
      ApplicationEntity,
      UserEntity,
      OfferEntity,
    ]),
    CompanyModule,
    ApplicationModule,
    UserModule,
    OfferModule,
  ],
  providers: [AppService],
})
export class AppModule {}
