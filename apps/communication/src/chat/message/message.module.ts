import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from '../entities/message.entity';

import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  exports: [MessageService],
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageService],
})
export class MessageModule {}
