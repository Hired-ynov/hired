import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { CompanyEntity } from './company/entities/company.entity';
import { ApplicationModule } from './application/application.module';
import { ApplicationEntity } from './application/entities/application.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { UserModule } from './users/user.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        database: configService.get('POSTGRES_DB'),
        entities: [CompanyEntity, ApplicationEntity, UserEntity],
        host: configService.get('POSTGRES_HOST'),
        password: configService.get('POSTGRES_PASSWORD'),
        port: configService.get<number>('POSTGRES_PORT'),
        synchronize: configService.get('NODE_ENV') !== 'production',
        type: 'postgres',
        username: configService.get('POSTGRES_USER'),
      }),
    }),
    TypeOrmModule.forFeature([CompanyEntity, ApplicationEntity, UserEntity]),
    CompanyModule,
    ApplicationModule,
    UserModule,
  ],
  providers: [AppService],
})
export class AppModule {}
