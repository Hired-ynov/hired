import { Injectable } from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  DeepPartial,
  FindOptionsOrder,
  ObjectLiteral,
} from 'typeorm';
import { PaginationOptions, PaginationResult, SortOptions } from './base.types';

@Injectable()
export abstract class BaseService<T extends ObjectLiteral, ID = string> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(createDto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(createDto);
    return await this.repository.save(entity);
  }

  async createMany(createDtos: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(createDtos);
    return await this.repository.save(entities);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return await this.repository.findOne({ where });
  }

  async findById(id: ID): Promise<T | null> {
    return await this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  async findWithPagination(
    paginationOptions: PaginationOptions = {},
    findOptions?: FindManyOptions<T>,
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10 } = paginationOptions;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      ...findOptions,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async findWithSort(
    sortOptions: SortOptions,
    findOptions?: FindManyOptions<T>,
  ): Promise<T[]> {
    const order = {
      [sortOptions.field]: sortOptions.order,
    } as FindOptionsOrder<T>;

    return await this.repository.find({
      ...findOptions,
      order,
    });
  }

  async update(id: ID, updateDto: DeepPartial<T>): Promise<T> {
    await this.repository.update(id as any, updateDto as any);
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} not found after update`);
    }
    return entity;
  }

  async updateMany(
    where: FindOptionsWhere<T>,
    updateDto: DeepPartial<T>,
  ): Promise<void> {
    await this.repository.update(where, updateDto as any);
  }

  async remove(id: ID): Promise<void> {
    await this.repository.delete(id as any);
  }

  async softDelete(id: ID): Promise<void> {
    await this.repository.softDelete(id as any);
  }

  async restore(id: ID): Promise<void> {
    await this.repository.restore(id as any);
  }

  async removeMany(where: FindOptionsWhere<T>): Promise<void> {
    await this.repository.delete(where);
  }

  async softDeleteMany(where: FindOptionsWhere<T>): Promise<void> {
    await this.repository.softDelete(where);
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return await this.repository.count(options);
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async findOrFail(where: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.findOne(where);
    if (!entity) {
      throw new Error('Entity not found');
    }
    return entity;
  }

  async findByIdOrFail(id: ID): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return entity;
  }
}
