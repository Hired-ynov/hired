import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@repo/nest-service';
import { UserEntity } from '@repo/entities';

@Injectable()
export class AppService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    userRepository: Repository<UserEntity>,
  ) {
    super(userRepository);
  }

  getPing() {
    return {
      message: 'pong',
    };
  }
}
