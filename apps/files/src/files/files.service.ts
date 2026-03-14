import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from '@repo/entities';
import { File } from '@repo/models';
import { BaseService } from '@repo/nest-service';
import { Repository } from 'typeorm';

import { MinioService } from './minio.service';

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
  async uploadFile(file: Express.Multer.File): Promise<File> {
    const timestamp = Date.now();
    const safeOriginalName = file.originalname.replaceAll(
      /[^a-zA-Z0-9.-]/g,
      '_',
    );
    const fileName = `${timestamp}-${safeOriginalName}`;

    const { url } = await this.minioService.uploadFile(file, fileName);

    return await this.create({
      metadata: {
        hash: fileName,
        size: file.size,
      },
      name: file.originalname,
      path: url,
      type: file.mimetype,
    });
  }

  /**
   * Récupère tous les fichiers
   */
  async findAllFiles(): Promise<File[]> {
    return await this.findAll();
  }

  /**
   * Récupère un fichier par son ID
   */
  async findFileById(id: string): Promise<File> {
    const file = await this.findOne({ id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
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
  async getFileStream(id: string): Promise<{ stream: any; file: File }> {
    const file = await this.findOne({ id });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    const fileName = file.metadata?.hash;
    if (!fileName) {
      throw new Error('File name not found in metadata');
    }

    const stream = await this.minioService.getFileStream(fileName);
    return { file, stream };
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
  async getFilesByIds(ids: string[]): Promise<File[]> {
    const files = await Promise.all(
      ids.map(async (id) => {
        return await this.findOne({ id });
      }),
    );

    return files.filter((file) => file !== null);
  }
}
