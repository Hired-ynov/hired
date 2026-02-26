import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { FilesService } from './files.service';
import { FileDTO } from '@repo/models';

interface UploadFilePayload {
  file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  };
}

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

  @MessagePattern({ cmd: 'upload_file' })
  async uploadFile(@Payload() payload: UploadFilePayload): Promise<FileDTO> {
    const { file } = payload;

    if (!file) {
      throw new RpcException('No file provided');
    }

    try {
      const multerFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: file.originalname,
        encoding: '7bit',
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      return await this.filesService.uploadFile(multerFile);
    } catch (error) {
      throw new RpcException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @MessagePattern({ cmd: 'find_all_files' })
  async findAll(): Promise<FileDTO[]> {
    return this.filesService.findAllFiles();
  }

  @MessagePattern({ cmd: 'find_one_file' })
  async findOne(@Payload() payload: FindOnePayload): Promise<FileDTO> {
    try {
      return await this.filesService.findFileById(payload.id);
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error.message : 'File not found',
      );
    }
  }

  @MessagePattern({ cmd: 'get_file_url' })
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

  @MessagePattern({ cmd: 'delete_file' })
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

  @MessagePattern({ cmd: 'get_files_by_ids' })
  async getFilesByIds(
    @Payload() payload: { ids: string[] },
  ): Promise<FileDTO[]> {
    try {
      return await this.filesService.getFilesByIds(payload.ids);
    } catch (error) {
      throw new RpcException(
        `Failed to retrieve files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
