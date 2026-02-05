import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@repo/nest-service';
import { User } from './users/models/user.entity';

@Injectable()
export class AppService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  getPing() {
    return {
      message: 'pong',
    };
  }
}
