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
  HttpCode,
  HttpStatus,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { FileDTO } from '@repo/models';

/**
 * Contrôleur HTTP REST pour la gestion des fichiers
 * Délègue toute la logique métier au FilesService
 */
@Controller('files')
export class FilesHttpController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileDTO> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      return await this.filesService.uploadFile(file);
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Get()
  async findAll(): Promise<FileDTO[]> {
    return this.filesService.findAllFiles();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FileDTO> {
    return this.filesService.findFileById(id);
  }

  @Get(':id/url')
  async getFileUrl(@Param('id') id: string): Promise<{ url: string }> {
    try {
      return await this.filesService.getFileUrl(id);
    } catch (error) {
      throw new BadRequestException(
        `Failed to get file URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      const { stream, file } = await this.filesService.getFileStream(id);

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
    try {
      await this.filesService.deleteFile(id);
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
