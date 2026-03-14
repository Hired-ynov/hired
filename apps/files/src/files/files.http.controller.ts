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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FileDTO } from '@repo/models';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';

import { FilesService } from './files.service';

/**
 * Contrôleur HTTP REST pour la gestion des fichiers
 * Délègue toute la logique métier au FilesService
 */
@ApiTags('files')
@Controller('files')
export class FilesHttpController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      properties: {
        file: {
          format: 'binary',
          type: 'string',
        },
      },
      type: 'object',
    },
  })
  @ApiResponse({
    description: 'File successfully uploaded',
    status: HttpStatus.CREATED,
    type: FileDTO,
  })
  @ApiResponse({
    description: 'No file provided or upload failed',
    status: HttpStatus.BAD_REQUEST,
  })
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
      const uploadedFile = await this.filesService.uploadFile(file);
      return plainToInstance(FileDTO, uploadedFile);
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @ApiOperation({ summary: 'Retrieve all files' })
  @ApiResponse({
    description: 'List of all files',
    status: HttpStatus.OK,
    type: [FileDTO],
  })
  @Get()
  async findAll(): Promise<FileDTO[]> {
    const files = await this.filesService.findAllFiles();
    return files.map((file) => plainToInstance(FileDTO, file));
  }

  @ApiOperation({ summary: 'Find a file by its ID' })
  @ApiParam({ description: 'The unique identifier of the file', name: 'id' })
  @ApiResponse({
    description: 'The completed file object',
    status: HttpStatus.OK,
    type: FileDTO,
  })
  @ApiResponse({ description: 'File not found', status: HttpStatus.NOT_FOUND })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FileDTO> {
    const file = this.filesService.findFileById(id);
    return plainToInstance(FileDTO, file);
  }

  @ApiOperation({ summary: 'Get the pre-signed URL for a file' })
  @ApiParam({ description: 'The unique identifier of the file', name: 'id' })
  @ApiResponse({
    description: 'The URL created successfully',
    status: HttpStatus.OK,
  })
  @ApiResponse({
    description: 'Failed to get file URL',
    status: HttpStatus.BAD_REQUEST,
  })
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

  @ApiOperation({ summary: 'Download a file' })
  @ApiParam({
    description: 'The unique identifier of the file to download',
    name: 'id',
  })
  @ApiResponse({
    description: 'The file stream ready for download',
    status: HttpStatus.OK,
  })
  @ApiResponse({
    description: 'Failed to download file',
    status: HttpStatus.BAD_REQUEST,
  })
  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      const { file, stream } = await this.filesService.getFileStream(id);

      res.set({
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Type': file.type || 'application/octet-stream',
      });

      return new StreamableFile(stream);
    } catch (error) {
      throw new BadRequestException(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @ApiOperation({ summary: 'Delete a file by its ID' })
  @ApiParam({
    description: 'The unique identifier of the file to delete',
    name: 'id',
  })
  @ApiResponse({
    description: 'The file has been successfully deleted',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiResponse({
    description: 'Failed to delete file',
    status: HttpStatus.BAD_REQUEST,
  })
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
