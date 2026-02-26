import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileDTO } from '@repo/models';
import { BaseService } from '@repo/nest-service';
import { Repository } from 'typeorm';
import { MinioService } from './minio.service';
import { plainToInstance } from 'class-transformer';
import { FileEntity } from '@repo/entities';

@Injectable()
export class FilesService extends BaseService<FileEntity> {
  constructor(
    @InjectRepository(FileEntity)
    fileRepository: Repository<FileEntity>,
    private readonly minioService: MinioService,
  ) {
    super(fileRepository);
  }

  /**
   * Upload un fichier vers MinIO et sauvegarde les métadonnées en base
   */
  async uploadFile(file: Express.Multer.File): Promise<FileDTO> {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;

    const { url } = await this.minioService.uploadFile(file, fileName);
    const fileEntity = await this.create({
      name: file.originalname,
      path: url,
      type: file.mimetype,
      metadata: {
        size: file.size,
        hash: fileName,
      },
    });

    return plainToInstance(FileDTO, fileEntity);
  }

  /**
   * Récupère tous les fichiers
   */
  async findAllFiles(): Promise<FileDTO[]> {
    const files = await this.findAll();
    return plainToInstance(FileDTO, files);
  }

  /**
   * Récupère un fichier par son ID
   */
  async findFileById(id: string): Promise<FileDTO> {
    const file = await this.findOne({ id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return plainToInstance(FileDTO, file);
  }

  /**
   * Récupère l'URL présignée d'un fichier
   */
  async getFileUrl(id: string): Promise<{ url: string }> {
    const file = await this.findOne({ id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    const fileName = file.metadata?.hash;
    if (!fileName) {
      throw new Error('File name not found in metadata');
    }

    const url = await this.minioService.getFileUrl(fileName);
    return { url };
  }

  /**
   * Récupère le stream d'un fichier pour le téléchargement
   */
  async getFileStream(id: string): Promise<{ stream: any; file: FileEntity }> {
    const file = await this.findOne({ id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    const fileName = file.metadata?.hash;
    if (!fileName) {
      throw new Error('File name not found in metadata');
    }

    const stream = await this.minioService.getFileStream(fileName);
    return { stream, file };
  }

  /**
   * Supprime un fichier de MinIO et de la base de données
   */
  async deleteFile(id: string): Promise<void> {
    const file = await this.findOne({ id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    const fileName = file.metadata?.hash;
    if (fileName) {
      await this.minioService.deleteFile(fileName);
    }
    await this.remove(id);
  }

  /**
   * Récupère plusieurs fichiers par leurs IDs
   */
  async getFilesByIds(ids: string[]): Promise<FileDTO[]> {
    const files = await Promise.all(
      ids.map(async (id) => {
        const file = await this.findOne({ id });
        return file;
      }),
    );

    const validFiles = files.filter((file) => file !== null);
    return plainToInstance(FileDTO, validFiles);
  }
}
