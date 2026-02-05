/// <reference types="multer" />

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { FilesService } from './files.service';
import { MinioService } from './minio.service';
import { FileDTO } from '@repo/models';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly minioService: MinioService,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileDTO> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;

    try {
      const { url } = await this.minioService.uploadFile(file, fileName);
      const fileEntity = await this.filesService.create({
        name: file.originalname,
        path: url,
        type: file.mimetype,
        metadata: {
          size: file.size,
          hash: fileName,
        },
      });

      return plainToInstance(FileDTO, fileEntity);
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Get()
  async findAll(): Promise<FileDTO[]> {
    const files = await this.filesService.findAll();
    return plainToInstance(FileDTO, files);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FileDTO> {
    const file = await this.filesService.findOne({ id: id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return plainToInstance(FileDTO, file);
  }

  @Get(':id/url')
  async getFileUrl(@Param('id') id: string): Promise<{ url: string }> {
    const file = await this.filesService.findOne({ id: id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    const fileName = file.metadata?.hash;
    if (!fileName) {
      throw new BadRequestException('File name not found in metadata');
    }

    const url = await this.minioService.getFileUrl(fileName);
    return { url };
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.filesService.findOne({ id: id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    const fileName = file.metadata?.hash;
    if (!fileName) {
      throw new BadRequestException('File name not found in metadata');
    }

    try {
      const stream = await this.minioService.getFileStream(fileName);

      res.set({
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.name}"`,
      });

      return new StreamableFile(stream);
    } catch (error) {
      throw new BadRequestException(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const file = await this.filesService.findOne({ id: id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    try {
      const fileName = file.metadata?.hash;
      if (fileName) {
        await this.minioService.deleteFile(fileName);
      }
      await this.filesService.remove(id);
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
