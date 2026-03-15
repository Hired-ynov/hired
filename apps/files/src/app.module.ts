import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '@repo/entities';
import { cache } from '@repo/redis-config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './files/files.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        return cache.AUTO({
          REDIS_URL: configService.get<string>('REDIS_URL'),
        });
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        database: configService.get('POSTGRES_DB'),
        entities: [FileEntity],
        host: configService.get('POSTGRES_HOST'),
        password: configService.get('POSTGRES_PASSWORD'),
        port: configService.get<number>('POSTGRES_PORT'),
        synchronize: configService.get('NODE_ENV') !== 'production',
        type: 'postgres',
        username: configService.get('POSTGRES_USER'),
      }),
    }),
    FilesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
