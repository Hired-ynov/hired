import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { File } from '@repo/models';

import { FilesService } from './files.service';

interface FindOnePayload {
  id: string;
}

interface DeleteFilePayload {
  id: string;
}

/**
 * Contrôleur RabbitMQ pour la gestion des fichiers
 * Délègue toute la logique métier au FilesService
 */
@Controller()
export class FilesMicroserviceController {
  constructor(private readonly filesService: FilesService) {}

  @MessagePattern('file.file.uploadFile')
  async uploadFile(
    @Payload() payload: { file: Express.Multer.File },
  ): Promise<File> {
    const { file } = payload;
    if (!file) {
      throw new RpcException('No file provided');
    }

    try {
      const fileBuffer = Buffer.from((file.buffer as any).data);

      const fileWithBuffer: Express.Multer.File = {
        ...file,
        buffer: fileBuffer,
      };
      return await this.filesService.uploadFile(fileWithBuffer);
    } catch (error) {
      throw new RpcException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @MessagePattern('file.file.findAll')
  async findAll(): Promise<File[]> {
    return this.filesService.findAllFiles();
  }

  @MessagePattern('file.file.findOne')
  async findOne(@Payload() payload: FindOnePayload): Promise<File> {
    try {
      return await this.filesService.findFileById(payload.id);
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : 'File not found',
      );
    }
  }

  @MessagePattern('file.file.getFileUrl')
  async getFileUrl(
    @Payload() payload: FindOnePayload,
  ): Promise<{ url: string }> {
    try {
      return await this.filesService.getFileUrl(payload.id);
    } catch (error) {
      throw new RpcException(
        `Failed to get file URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @MessagePattern('file.file.deleteFile')
  async remove(
    @Payload() payload: DeleteFilePayload,
  ): Promise<{ success: boolean }> {
    try {
      await this.filesService.deleteFile(payload.id);
      return { success: true };
    } catch (error) {
      throw new RpcException(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @MessagePattern('file.file.getFilesByIds')
  async getFilesByIds(@Payload() payload: { ids: string[] }): Promise<File[]> {
    try {
      return await this.filesService.getFilesByIds(payload.ids);
    } catch (error) {
      throw new RpcException(
        `Failed to retrieve files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
