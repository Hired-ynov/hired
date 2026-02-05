import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MinioService } from './minio.service';
import { FileEntity } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [FilesController],
  providers: [FilesService, MinioService],
  exports: [FilesService, MinioService],
})
export class FilesModule {}
