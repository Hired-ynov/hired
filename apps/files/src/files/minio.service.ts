import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'MINIO_BUCKET_NAME',
      'uploads',
    );

    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'true');

    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: useSSL === 'true',
      accessKey: this.configService.get<string>(
        'MINIO_ROOT_USER',
        'minioadmin',
      ),
      secretKey: this.configService.get<string>(
        'MINIO_ROOT_PASSWORD',
        'minioadmin',
      ),
    });

    this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      }
    } catch (error) {
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<{ url: string; etag: string }> {
    try {
      const metaData = {
        'Content-Type': file.mimetype,
        'Original-Name': file.originalname,
      };

      const result = await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        metaData,
      );

      const url = await this.getFileUrl(fileName);

      return {
        url,
        etag: result.etag,
      };
    } catch (error) {
      throw error;
    }
  }

  async getFileUrl(fileName: string): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        fileName,
        24 * 60 * 60, // 24 hours
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
      this.logger.log(`File '${fileName}' deleted successfully`);
    } catch (error) {
      throw error;
    }
  }

  async getFileStream(fileName: string): Promise<any> {
    try {
      return await this.minioClient.getObject(this.bucketName, fileName);
    } catch (error) {
      throw error;
    }
  }
}
