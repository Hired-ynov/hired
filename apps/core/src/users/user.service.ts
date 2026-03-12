import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@repo/entities';
import { BaseService } from '@repo/nest-service';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

const hashPassword = bcrypt.hash as (
  password: string,
  saltRounds: number,
) => Promise<string>;
const comparePassword = bcrypt.compare as (
  password: string,
  hashValue: string,
) => Promise<boolean>;

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {
    super(usersRepository);
  }

  async generatePasswordHash(password: string): Promise<string> {
    return hashPassword(password, 12);
  }

  async verifyPassword(password: string, hashValue: string): Promise<boolean> {
    return comparePassword(password, hashValue);
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
