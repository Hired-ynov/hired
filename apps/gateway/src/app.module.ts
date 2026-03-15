import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthSharedModule, AuthGuard } from '@repo/commun';
import { cache } from '@repo/redis-config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommunicationModule } from './communication/communication.module';
import { CoreModule } from './core/core.module';
import { FilesModule } from './files/files.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    AuthSharedModule.forRoot(),
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
