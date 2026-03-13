import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@repo/entities';
import { BaseService } from '@repo/nest-service';
import { Repository } from 'typeorm';

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
