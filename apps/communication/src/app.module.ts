import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Message } from './message.entity';

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
        entities: [Message],
        host: configService.get('POSTGRES_HOST'),
        password: configService.get('POSTGRES_PASSWORD'),
        port: configService.get<number>('POSTGRES_PORT'),
        synchronize: configService.get('NODE_ENV') !== 'production',
        type: 'postgres',
        username: configService.get('POSTGRES_USER'),
      }),
    }),
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [AppService],
})
export class AppModule {}
