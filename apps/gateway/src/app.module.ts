import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommunicationModule } from './communication/communication.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { FilesModule } from './files/files.module';
import { CacheModule } from '@nestjs/cache-manager';
import { cache } from '@repo/redis-config';
import { AuthSharedModule, AuthGuard } from '@repo/commun';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthSharedModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return cache.REDIS({
          REDIS_URL: configService.get<string>('REDIS_URL'),
        });
      },
    }),
    CommunicationModule,
    AuthModule,
    CoreModule,
    FilesModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
