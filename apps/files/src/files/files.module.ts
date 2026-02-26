import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesHttpController } from './files.http.controller';
import { FilesMicroserviceController } from './files.microservice.controller';
import { FilesService } from './files.service';
import { MinioService } from './minio.service';
import { FileEntity } from '@repo/entities';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [FilesHttpController, FilesMicroserviceController],
  providers: [FilesService, MinioService],
  exports: [FilesService, MinioService],
})
export class FilesModule {}
