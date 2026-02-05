import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
import { FilesModule } from './files/files.module';
import { FileEntity } from './files/entities/file.entity';

@Module({
  controllers: [AppController, FilesController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [FileEntity],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([FileEntity]),
    FilesModule,
  ],
  providers: [AppService, FilesService],
})
export class AppModule {}
