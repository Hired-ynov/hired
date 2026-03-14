import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilesService } from '../../../src/files/files.service';
import { FileEntity } from '../../../src/files/entities/file.entity';

describe('FilesService', () => {
  let service: FilesService;
  let repository: jest.Mocked<Repository<FileEntity>>;

  const mockFileEntity: FileEntity = {
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

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      restore: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(FileEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    repository = module.get(getRepositoryToken(FileEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have repository injected', () => {
      expect(repository).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a file entity', async () => {
      const createDto = {
        name: 'test.html',
        path: 'http://localhost:9000/uploads/test.html',
        type: 'text/html',
        metadata: {
          size: 2723,
          hash: '1771835910066-test.html',
        },
      };

      repository.create.mockReturnValue(mockFileEntity);
      repository.save.mockResolvedValue(mockFileEntity);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockFileEntity);
      expect(result).toEqual(mockFileEntity);
    });

    it('should handle creation with partial data', async () => {
      const createDto = {
        name: 'test.pdf',
        path: 'http://localhost:9000/uploads/test.pdf',
        type: 'application/pdf',
      };

      const entityWithoutMetadata = {
        ...mockFileEntity,
        ...createDto,
        metadata: undefined,
      };
      repository.create.mockReturnValue(entityWithoutMetadata);
      repository.save.mockResolvedValue(entityWithoutMetadata);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(entityWithoutMetadata);
    });
  });

  describe('createMany', () => {
    it('should create multiple file entities', async () => {
      const createDtos = [
        {
          name: 'file1.txt',
          path: 'http://localhost:9000/uploads/file1.txt',
          type: 'text/plain',
        },
        {
          name: 'file2.txt',
          path: 'http://localhost:9000/uploads/file2.txt',
          type: 'text/plain',
        },
      ];

      const mockEntities = [
        { ...mockFileEntity, id: '1', name: 'file1.txt' },
        { ...mockFileEntity, id: '2', name: 'file2.txt' },
      ];

      repository.create.mockReturnValue(mockEntities as any);
      repository.save.mockResolvedValue(mockEntities as any);

      const result = await service.createMany(createDtos);

      expect(repository.create).toHaveBeenCalledWith(createDtos);
      expect(repository.save).toHaveBeenCalledWith(mockEntities);
      expect(result).toEqual(mockEntities);
    });
  });

  describe('findAll', () => {
    it('should return all file entities', async () => {
      const mockFiles = [mockFileEntity, { ...mockFileEntity, id: '456' }];
      repository.find.mockResolvedValue(mockFiles);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockFiles);
    });

    it('should return all files with options', async () => {
      const options = { where: { type: 'text/html' } };
      const mockFiles = [mockFileEntity];
      repository.find.mockResolvedValue(mockFiles);

      const result = await service.findAll(options);

      expect(repository.find).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockFiles);
    });

    it('should return empty array when no files exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find a file by where condition', async () => {
      const where = { id: mockFileEntity.id };
      repository.findOne.mockResolvedValue(mockFileEntity);

      const result = await service.findOne(where);

      expect(repository.findOne).toHaveBeenCalledWith({ where });
      expect(result).toEqual(mockFileEntity);
    });

    it('should return null when file is not found', async () => {
      const where = { id: 'non-existent-id' };
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne(where);

      expect(result).toBeNull();
    });

    it('should find by multiple conditions', async () => {
      const where = { name: 'test.html', type: 'text/html' };
      repository.findOne.mockResolvedValue(mockFileEntity);

      const result = await service.findOne(where);

      expect(repository.findOne).toHaveBeenCalledWith({ where });
      expect(result).toEqual(mockFileEntity);
    });
  });

  describe('findById', () => {
    it('should find a file by id', async () => {
      repository.findOneBy.mockResolvedValue(mockFileEntity);

      const result = await service.findById(mockFileEntity.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockFileEntity.id,
      });
      expect(result).toEqual(mockFileEntity);
    });

    it('should return null when file is not found by id', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated results', async () => {
      const mockFiles = [mockFileEntity, { ...mockFileEntity, id: '456' }];
      repository.findAndCount.mockResolvedValue([mockFiles, 10]);

      const result = await service.findWithPagination({ page: 1, limit: 2 });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
      });
      expect(result).toEqual({
        data: mockFiles,
        total: 10,
        page: 1,
        limit: 2,
        totalPages: 5,
        hasNext: true,
        hasPrevious: false,
      });
    });

    it('should use default pagination options', async () => {
      repository.findAndCount.mockResolvedValue([[mockFileEntity], 1]);

      const result = await service.findWithPagination();

      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should calculate correct pagination metadata', async () => {
      repository.findAndCount.mockResolvedValue([[mockFileEntity], 1]);

      const result = await service.findWithPagination({ page: 2, limit: 5 });

      expect(result).toEqual({
        data: [mockFileEntity],
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
        hasNext: false,
        hasPrevious: true,
      });
    });
  });

  describe('findWithSort', () => {
    it('should return sorted results', async () => {
      const mockFiles = [mockFileEntity];
      const sortOptions = { field: 'name', order: 'ASC' as const };
      repository.find.mockResolvedValue(mockFiles);

      const result = await service.findWithSort(sortOptions);

      expect(repository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockFiles);
    });

    it('should sort in descending order', async () => {
      const mockFiles = [mockFileEntity];
      const sortOptions = { field: 'createdAt', order: 'DESC' as const };
      repository.find.mockResolvedValue(mockFiles);

      const result = await service.findWithSort(sortOptions);

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockFiles);
    });
  });

  describe('update', () => {
    it('should update a file entity', async () => {
      const updateDto = { name: 'updated.html' };
      const updatedEntity = { ...mockFileEntity, name: 'updated.html' };

      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOneBy.mockResolvedValue(updatedEntity);

      const result = await service.update(mockFileEntity.id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(
        { id: mockFileEntity.id },
        updateDto,
      );
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockFileEntity.id,
      });
      expect(result).toEqual(updatedEntity);
    });

    it('should throw error when entity not found after update', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'test' }),
      ).rejects.toThrow(
        'Entity with id non-existent-id not found after update',
      );
    });
  });

  describe('updateMany', () => {
    it('should update multiple entities', async () => {
      const where = { type: 'text/html' };
      const updateDto = { type: 'text/plain' };

      repository.update.mockResolvedValue({ affected: 2 } as any);

      await service.updateMany(where, updateDto);

      expect(repository.update).toHaveBeenCalledWith(where, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a file entity', async () => {
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockFileEntity.id);

      expect(repository.delete).toHaveBeenCalledWith({ id: mockFileEntity.id });
    });

    it('should not throw error if entity does not exist', async () => {
      repository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted file entity', async () => {
      repository.restore.mockResolvedValue({ affected: 1 } as any);

      await service.restore(mockFileEntity.id);

      expect(repository.restore).toHaveBeenCalledWith({
        id: mockFileEntity.id,
      });
    });
  });

  describe('removeMany', () => {
    it('should delete multiple entities', async () => {
      const where = { type: 'text/html' };
      repository.delete.mockResolvedValue({ affected: 3 } as any);

      await service.removeMany(where);

      expect(repository.delete).toHaveBeenCalledWith(where);
    });
  });

  describe('count', () => {
    it('should count all entities', async () => {
      repository.count.mockResolvedValue(5);

      const result = await service.count();

      expect(repository.count).toHaveBeenCalledWith(undefined);
      expect(result).toBe(5);
    });

    it('should count with options', async () => {
      const options = { where: { type: 'text/html' } };
      repository.count.mockResolvedValue(3);

      const result = await service.count(options);

      expect(repository.count).toHaveBeenCalledWith(options);
      expect(result).toBe(3);
    });
  });

  describe('exists', () => {
    it('should return true when entity exists', async () => {
      const where = { id: mockFileEntity.id };
      repository.count.mockResolvedValue(1);

      const result = await service.exists(where);

      expect(repository.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(true);
    });

    it('should return false when entity does not exist', async () => {
      const where = { id: 'non-existent-id' };
      repository.count.mockResolvedValue(0);

      const result = await service.exists(where);

      expect(result).toBe(false);
    });
  });

  describe('findOrFail', () => {
    it('should return entity when found', async () => {
      const where = { id: mockFileEntity.id };
      repository.findOne.mockResolvedValue(mockFileEntity);

      const result = await service.findOrFail(where);

      expect(repository.findOne).toHaveBeenCalledWith({ where });
      expect(result).toEqual(mockFileEntity);
    });

    it('should throw error when entity not found', async () => {
      const where = { id: 'non-existent-id' };
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOrFail(where)).rejects.toThrow(
        'Entity not found',
      );
    });
  });

  describe('findByIdOrFail', () => {
    it('should return entity when found by id', async () => {
      repository.findOneBy.mockResolvedValue(mockFileEntity);

      const result = await service.findByIdOrFail(mockFileEntity.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockFileEntity.id,
      });
      expect(result).toEqual(mockFileEntity);
    });

    it('should throw error when entity not found by id', async () => {
      const nonExistentId = 'non-existent-id';
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findByIdOrFail(nonExistentId)).rejects.toThrow(
        `Entity with id ${nonExistentId} not found`,
      );
    });
  });
});
