import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { MinioService } from '../../../src/files/minio.service';
import * as Minio from 'minio';
import { Readable } from 'stream';

jest.mock('minio');

describe('MinioService', () => {
  let service: MinioService;
  let configService: jest.Mocked<ConfigService>;
  let mockMinioClient: jest.Mocked<Minio.Client>;

  const mockMulterFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.html',
    encoding: '7bit',
    mimetype: 'text/html',
    size: 2723,
    buffer: Buffer.from('test content'),
    stream: new Readable(),
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    mockMinioClient = {
      bucketExists: jest.fn(),
      makeBucket: jest.fn(),
      putObject: jest.fn(),
      presignedGetObject: jest.fn(),
      removeObject: jest.fn(),
      getObject: jest.fn(),
    } as any;

    (Minio.Client as jest.MockedClass<typeof Minio.Client>).mockImplementation(
      () => mockMinioClient,
    );

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          MINIO_BUCKET_NAME: 'uploads',
          MINIO_USE_SSL: 'true',
          MINIO_ENDPOINT: 'localhost',
          MINIO_PORT: 9000,
          MINIO_ROOT_USER: 'minioadmin',
          MINIO_ROOT_PASSWORD: 'minioadmin',
        };
        return config[key] ?? defaultValue;
      }),
    };

    mockMinioClient.bucketExists.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize Minio client with correct configuration', () => {
      expect(Minio.Client).toHaveBeenCalledWith({
        endPoint: 'localhost',
        port: 9000,
        useSSL: true,
        accessKey: 'minioadmin',
        secretKey: 'minioadmin',
      });
    });

    it('should check if bucket exists on initialization', () => {
      expect(mockMinioClient.bucketExists).toHaveBeenCalledWith('uploads');
    });

    it('should use SSL when MINIO_USE_SSL is true', async () => {
      expect(Minio.Client).toHaveBeenCalledWith(
        expect.objectContaining({
          useSSL: true,
        }),
      );
    });
  });

  describe('ensureBucketExists', () => {
    it('should create bucket when it does not exist', async () => {
      mockMinioClient.bucketExists.mockResolvedValue(false);
      mockMinioClient.makeBucket.mockResolvedValue(undefined);

      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MinioService,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const newService = module.get<MinioService>(MinioService);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockMinioClient.bucketExists).toHaveBeenCalledWith('uploads');
      expect(mockMinioClient.makeBucket).toHaveBeenCalledWith(
        'uploads',
        'us-east-1',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        "Bucket 'uploads' created successfully",
      );

      loggerSpy.mockRestore();
    });

    it('should not create bucket when it already exists', async () => {
      mockMinioClient.bucketExists.mockResolvedValue(true);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MinioService,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const newService = module.get<MinioService>(MinioService);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockMinioClient.bucketExists).toHaveBeenCalled();
      expect(mockMinioClient.makeBucket).not.toHaveBeenCalled();
    });
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const fileName = '1771835910066-test.html';
      const mockEtag = 'mock-etag-123';
      const mockUrl = 'http://localhost:9000/uploads/signed-url';

      mockMinioClient.putObject.mockResolvedValue({ etag: mockEtag } as any);
      mockMinioClient.presignedGetObject.mockResolvedValue(mockUrl);

      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      const result = await service.uploadFile(mockMulterFile, fileName);

      expect(mockMinioClient.putObject).toHaveBeenCalledWith(
        'uploads',
        fileName,
        mockMulterFile.buffer,
        mockMulterFile.size,
        {
          'Content-Type': 'text/html',
          'Original-Name': 'test.html',
        },
      );
      expect(mockMinioClient.presignedGetObject).toHaveBeenCalledWith(
        'uploads',
        fileName,
        24 * 60 * 60,
      );
      expect(result).toEqual({
        url: mockUrl,
        etag: mockEtag,
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `File '${fileName}' uploaded successfully`,
      );

      loggerSpy.mockRestore();
    });

    it('should include correct metadata when uploading', async () => {
      const fileName = 'test-file.pdf';
      const pdfFile: Express.Multer.File = {
        ...mockMulterFile,
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
      };

      mockMinioClient.putObject.mockResolvedValue({ etag: 'etag' } as any);
      mockMinioClient.presignedGetObject.mockResolvedValue('url');

      await service.uploadFile(pdfFile, fileName);

      expect(mockMinioClient.putObject).toHaveBeenCalledWith(
        'uploads',
        fileName,
        pdfFile.buffer,
        pdfFile.size,
        {
          'Content-Type': 'application/pdf',
          'Original-Name': 'document.pdf',
        },
      );
    });

    it('should throw error when upload fails', async () => {
      const fileName = 'test.html';
      const error = new Error('Upload failed');

      mockMinioClient.putObject.mockRejectedValue(error);

      await expect(
        service.uploadFile(mockMulterFile, fileName),
      ).rejects.toThrow('Upload failed');
    });

    it('should handle putObject error', async () => {
      const fileName = 'test.html';
      mockMinioClient.putObject.mockRejectedValue(
        new Error('Connection timeout'),
      );

      await expect(
        service.uploadFile(mockMulterFile, fileName),
      ).rejects.toThrow('Connection timeout');

      expect(mockMinioClient.putObject).toHaveBeenCalled();
    });
  });

  describe('getFileUrl', () => {
    it('should generate a presigned URL for a file', async () => {
      const fileName = '1771835910066-test.html';
      const mockUrl =
        'http://localhost:9000/uploads/1771835910066-test.html?signature=xyz';

      mockMinioClient.presignedGetObject.mockResolvedValue(mockUrl);

      const result = await service.getFileUrl(fileName);

      expect(mockMinioClient.presignedGetObject).toHaveBeenCalledWith(
        'uploads',
        fileName,
        24 * 60 * 60,
      );
      expect(result).toBe(mockUrl);
    });

    it('should use 24 hours expiry for presigned URL', async () => {
      const fileName = 'test-file.txt';
      mockMinioClient.presignedGetObject.mockResolvedValue('mock-url');

      await service.getFileUrl(fileName);

      expect(mockMinioClient.presignedGetObject).toHaveBeenCalledWith(
        'uploads',
        fileName,
        86400, // 24 * 60 * 60
      );
    });

    it('should throw error when URL generation fails', async () => {
      const fileName = 'test.html';
      const error = new Error('File not found in bucket');

      mockMinioClient.presignedGetObject.mockRejectedValue(error);

      await expect(service.getFileUrl(fileName)).rejects.toThrow(
        'File not found in bucket',
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const fileName = '1771835910066-test.html';

      mockMinioClient.removeObject.mockResolvedValue(undefined);

      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await service.deleteFile(fileName);

      expect(mockMinioClient.removeObject).toHaveBeenCalledWith(
        'uploads',
        fileName,
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `File '${fileName}' deleted successfully`,
      );

      loggerSpy.mockRestore();
    });

    it('should throw error when deletion fails', async () => {
      const fileName = 'test.html';
      const error = new Error('Deletion failed');

      mockMinioClient.removeObject.mockRejectedValue(error);

      await expect(service.deleteFile(fileName)).rejects.toThrow(
        'Deletion failed',
      );
    });

    it('should handle non-existent file deletion attempt', async () => {
      const fileName = 'non-existent-file.txt';
      mockMinioClient.removeObject.mockRejectedValue(
        new Error('The specified key does not exist'),
      );

      await expect(service.deleteFile(fileName)).rejects.toThrow(
        'The specified key does not exist',
      );
    });
  });

  describe('getFileStream', () => {
    it('should get a file stream successfully', async () => {
      const fileName = '1771835910066-test.html';
      const mockStream = new Readable();
      mockStream.push('file content');
      mockStream.push(null);

      mockMinioClient.getObject.mockResolvedValue(mockStream as any);

      const result = await service.getFileStream(fileName);

      expect(mockMinioClient.getObject).toHaveBeenCalledWith(
        'uploads',
        fileName,
      );
      expect(result).toBe(mockStream);
    });

    it('should return stream for different file types', async () => {
      const fileName = 'document.pdf';
      const mockStream = new Readable();

      mockMinioClient.getObject.mockResolvedValue(mockStream as any);

      const result = await service.getFileStream(fileName);

      expect(mockMinioClient.getObject).toHaveBeenCalledWith(
        'uploads',
        fileName,
      );
      expect(result).toBeInstanceOf(Readable);
    });

    it('should throw error when stream retrieval fails', async () => {
      const fileName = 'test.html';
      const error = new Error('Stream retrieval failed');

      mockMinioClient.getObject.mockRejectedValue(error);

      await expect(service.getFileStream(fileName)).rejects.toThrow(
        'Stream retrieval failed',
      );
    });

    it('should handle non-existent file stream request', async () => {
      const fileName = 'missing-file.txt';
      mockMinioClient.getObject.mockRejectedValue(
        new Error('Object not found'),
      );

      await expect(service.getFileStream(fileName)).rejects.toThrow(
        'Object not found',
      );
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should use default values when config is not provided', async () => {
      const defaultConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => defaultValue),
      };

      mockMinioClient.bucketExists.mockResolvedValue(true);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MinioService,
          {
            provide: ConfigService,
            useValue: defaultConfigService,
          },
        ],
      }).compile();

      expect(Minio.Client).toHaveBeenCalledWith({
        endPoint: 'localhost',
        port: 9000,
        useSSL: true,
        accessKey: 'minioadmin',
        secretKey: 'minioadmin',
      });
    });

    it('should handle useSSL as false when configured', async () => {
      const sslConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          if (key === 'MINIO_USE_SSL') return 'false';
          if (key === 'MINIO_BUCKET_NAME') return 'uploads';
          if (key === 'MINIO_ENDPOINT') return 'localhost';
          if (key === 'MINIO_PORT') return 9000;
          if (key === 'MINIO_ROOT_USER') return 'minioadmin';
          if (key === 'MINIO_ROOT_PASSWORD') return 'minioadmin';
          return defaultValue;
        }),
      };

      mockMinioClient.bucketExists.mockResolvedValue(true);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MinioService,
          {
            provide: ConfigService,
            useValue: sslConfigService,
          },
        ],
      }).compile();

      expect(Minio.Client).toHaveBeenCalledWith(
        expect.objectContaining({
          useSSL: false,
        }),
      );
    });

    it('should use custom bucket name from config', async () => {
      const customConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          if (key === 'MINIO_BUCKET_NAME') return 'custom-bucket';
          const config: Record<string, any> = {
            MINIO_USE_SSL: 'true',
            MINIO_ENDPOINT: 'localhost',
            MINIO_PORT: 9000,
            MINIO_ROOT_USER: 'minioadmin',
            MINIO_ROOT_PASSWORD: 'minioadmin',
          };
          return config[key] ?? defaultValue;
        }),
      };

      mockMinioClient.bucketExists.mockResolvedValue(true);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MinioService,
          {
            provide: ConfigService,
            useValue: customConfigService,
          },
        ],
      }).compile();

      const customService = module.get<MinioService>(MinioService);

      expect(mockMinioClient.bucketExists).toHaveBeenCalledWith(
        'custom-bucket',
      );
    });
  });
});
