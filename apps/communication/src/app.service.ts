import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@repo/nest-service';
import { Message } from './message.entity';

@Injectable()
export class AppService extends BaseService<Message> {
  constructor(
    @InjectRepository(Message)
    messageRepository: Repository<Message>,
  ) {
    super(messageRepository);
  }

  getPing() {
    return {
      message: 'pong',
    };
  }
}
