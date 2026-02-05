import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '@repo/models';
import { BaseService } from '@repo/nest-service';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FilesService extends BaseService<FileEntity> {
  constructor(
    @InjectRepository(FileEntity)
    fileRepository: Repository<FileEntity>,
  ) {
    super(fileRepository);
  }
}
