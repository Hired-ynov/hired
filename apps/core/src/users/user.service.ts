import { Injectable } from '@nestjs/common';
import { UserEntity } from '@repo/entities';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { BaseService } from '@repo/nest-service';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {
    super(usersRepository);
  }

  async generatePasswordHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hashValue: string): Promise<boolean> {
    return await bcrypt.compare(password, hashValue);
  }

  async findOneByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByIdWithPassword(id: string): Promise<UserEntity | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();
  }
}
