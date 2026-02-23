import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { FilesController } from '../../../src/files/files.controller';
import { FilesService } from '../../../src/files/files.service';
import { MinioService } from '../../../src/files/minio.service';
import { FileDTO } from '@repo/models';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: jest.Mocked<FilesService>;
  let minioService: jest.Mocked<MinioService>;

  const mockFileEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    createdAt: new Date('2026-02-23T07:38:30.093Z'),
    updatedAt: new Date('2026-02-23T07:38:30.093Z'),
    name: 'test.html',
    path: 'http://localhost:9000/uploads/1771835910066-test.html',
    type: 'text/html',
    metadata: {
      size: 2723,
      hash: '1771835910066-test.html',
    },
  };

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
    const mockFilesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const mockMinioService = {
      uploadFile: jest.fn(),
      getFileUrl: jest.fn(),
      getFileStream: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get(FilesService);
    minioService = module.get(MinioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockUrl = 'http://localhost:9000/uploads/1771835910066-test.html';
      minioService.uploadFile.mockResolvedValue({
        url: mockUrl,
        etag: 'mock-etag-123',
      });
      filesService.create.mockResolvedValue(mockFileEntity as any);

      const result = await controller.uploadFile(mockMulterFile);

      expect(minioService.uploadFile).toHaveBeenCalledWith(
        mockMulterFile,
        expect.stringMatching(/^\d+-test\.html$/),
      );
      expect(filesService.create).toHaveBeenCalledWith({
        name: 'test.html',
        path: mockUrl,
        type: 'text/html',
        metadata: {
          size: 2723,
          hash: expect.stringMatching(/^\d+-test\.html$/),
        },
      });
      expect(result).toBeInstanceOf(FileDTO);
      expect(result.name).toBe('test.html');
    });

    it('should throw BadRequestException when no file is provided', async () => {
      await expect(controller.uploadFile(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.uploadFile(undefined as any)).rejects.toThrow(
        'No file provided',
      );
    });

    it('should throw BadRequestException when upload fails', async () => {
      minioService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(controller.uploadFile(mockMulterFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.uploadFile(mockMulterFile)).rejects.toThrow(
        'Failed to upload file: Upload failed',
      );
    });

    it('should handle unknown errors during upload', async () => {
      minioService.uploadFile.mockRejectedValue('Unknown error');

      await expect(controller.uploadFile(mockMulterFile)).rejects.toThrow(
        'Failed to upload file: Unknown error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all files', async () => {
      const mockFiles = [mockFileEntity, { ...mockFileEntity, id: '456' }];
      filesService.findAll.mockResolvedValue(mockFiles as any);

      const result = await controller.findAll();

      expect(filesService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(FileDTO);
    });

    it('should return empty array when no files exist', async () => {
      filesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a file by id', async () => {
      filesService.findOne.mockResolvedValue(mockFileEntity as any);

      const result = await controller.findOne(mockFileEntity.id);

      expect(filesService.findOne).toHaveBeenCalledWith({
        id: mockFileEntity.id,
      });
      expect(result).toBeInstanceOf(FileDTO);
      expect(result.id).toBe(mockFileEntity.id);
    });

    it('should throw NotFoundException when file is not found', async () => {
      const fileId = 'non-existent-id';
      filesService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(fileId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findOne(fileId)).rejects.toThrow(
        `File with ID ${fileId} not found`,
      );
    });
  });

  describe('getFileUrl', () => {
    it('should return the file URL', async () => {
      const mockUrl = 'http://localhost:9000/uploads/signed-url';
      filesService.findOne.mockResolvedValue(mockFileEntity as any);
      minioService.getFileUrl.mockResolvedValue(mockUrl);

      const result = await controller.getFileUrl(mockFileEntity.id);

      expect(filesService.findOne).toHaveBeenCalledWith({
        id: mockFileEntity.id,
      });
      expect(minioService.getFileUrl).toHaveBeenCalledWith(
        mockFileEntity.metadata.hash,
      );
      expect(result).toEqual({ url: mockUrl });
    });

    it('should throw NotFoundException when file is not found', async () => {
      const fileId = 'non-existent-id';
      filesService.findOne.mockResolvedValue(null);

      await expect(controller.getFileUrl(fileId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getFileUrl(fileId)).rejects.toThrow(
        `File with ID ${fileId} not found`,
      );
    });

    it('should throw BadRequestException when file hash is missing', async () => {
      const fileWithoutHash = { ...mockFileEntity, metadata: {} };
      filesService.findOne.mockResolvedValue(fileWithoutHash as any);

      await expect(controller.getFileUrl(mockFileEntity.id)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getFileUrl(mockFileEntity.id)).rejects.toThrow(
        'File name not found in metadata',
      );
    });
  });

  describe('downloadFile', () => {
    it('should download a file successfully', async () => {
      const mockStream = new Readable();
      mockStream.push('file content');
      mockStream.push(null);

      filesService.findOne.mockResolvedValue(mockFileEntity as any);
      minioService.getFileStream.mockResolvedValue(mockStream);

      const mockResponse = {
        set: jest.fn(),
      } as unknown as Response;

      const result = await controller.downloadFile(
        mockFileEntity.id,
        mockResponse,
      );

      expect(filesService.findOne).toHaveBeenCalledWith({
        id: mockFileEntity.id,
      });
      expect(minioService.getFileStream).toHaveBeenCalledWith(
        mockFileEntity.metadata.hash,
      );
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="test.html"',
      });
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should throw NotFoundException when file is not found', async () => {
      const fileId = 'non-existent-id';
      const mockResponse = {
        set: jest.fn(),
      } as unknown as Response;

      filesService.findOne.mockResolvedValue(null);

      await expect(
        controller.downloadFile(fileId, mockResponse),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.downloadFile(fileId, mockResponse),
      ).rejects.toThrow(`File with ID ${fileId} not found`);
    });

    it('should throw BadRequestException when file hash is missing', async () => {
      const fileWithoutHash = { ...mockFileEntity, metadata: {} };
      const mockResponse = {
        set: jest.fn(),
      } as unknown as Response;

      filesService.findOne.mockResolvedValue(fileWithoutHash as any);

      await expect(
        controller.downloadFile(mockFileEntity.id, mockResponse),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.downloadFile(mockFileEntity.id, mockResponse),
      ).rejects.toThrow('File name not found in metadata');
    });

    it('should throw BadRequestException when download fails', async () => {
      const mockResponse = {
        set: jest.fn(),
      } as unknown as Response;

      filesService.findOne.mockResolvedValue(mockFileEntity as any);
      minioService.getFileStream.mockRejectedValue(new Error('Stream error'));

      await expect(
        controller.downloadFile(mockFileEntity.id, mockResponse),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.downloadFile(mockFileEntity.id, mockResponse),
      ).rejects.toThrow('Failed to download file: Stream error');
    });

    it('should use default content type when file type is not set', async () => {
      const mockStream = new Readable();
      const fileWithoutType = { ...mockFileEntity, type: '' };
      const mockResponse = {
        set: jest.fn(),
      } as unknown as Response;

      filesService.findOne.mockResolvedValue(fileWithoutType as any);
      minioService.getFileStream.mockResolvedValue(mockStream);

      await controller.downloadFile(mockFileEntity.id, mockResponse);

      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="test.html"',
      });
    });
  });

  describe('remove', () => {
    it('should delete a file successfully', async () => {
      filesService.findOne.mockResolvedValue(mockFileEntity as any);
      minioService.deleteFile.mockResolvedValue(undefined);
      filesService.remove.mockResolvedValue(undefined);

      await controller.remove(mockFileEntity.id);

      expect(filesService.findOne).toHaveBeenCalledWith({
        id: mockFileEntity.id,
      });
      expect(minioService.deleteFile).toHaveBeenCalledWith(
        mockFileEntity.metadata.hash,
      );
      expect(filesService.remove).toHaveBeenCalledWith(mockFileEntity.id);
    });

    it('should throw NotFoundException when file is not found', async () => {
      const fileId = 'non-existent-id';
      filesService.findOne.mockResolvedValue(null);

      await expect(controller.remove(fileId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.remove(fileId)).rejects.toThrow(
        `File with ID ${fileId} not found`,
      );
    });

    it('should delete from database even when file hash is missing', async () => {
      const fileWithoutHash = { ...mockFileEntity, metadata: {} };
      filesService.findOne.mockResolvedValue(fileWithoutHash as any);
      filesService.remove.mockResolvedValue(undefined);

      await controller.remove(mockFileEntity.id);

      expect(minioService.deleteFile).not.toHaveBeenCalled();
      expect(filesService.remove).toHaveBeenCalledWith(mockFileEntity.id);
    });

    it('should throw BadRequestException when deletion fails', async () => {
      filesService.findOne.mockResolvedValue(mockFileEntity as any);
      minioService.deleteFile.mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.remove(mockFileEntity.id)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.remove(mockFileEntity.id)).rejects.toThrow(
        'Failed to delete file: Deletion failed',
      );
    });

    it('should handle unknown errors during deletion', async () => {
      filesService.findOne.mockResolvedValue(mockFileEntity as any);
      minioService.deleteFile.mockRejectedValue('Unknown error');

      await expect(controller.remove(mockFileEntity.id)).rejects.toThrow(
        'Failed to delete file: Unknown error',
      );
    });
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have filesService injected', () => {
      expect(filesService).toBeDefined();
    });

    it('should have minioService injected', () => {
      expect(minioService).toBeDefined();
    });
  });
});
