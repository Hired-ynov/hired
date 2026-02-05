import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversation } from '../entities/conversation.entity';

import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  controllers: [ConversationController],
  exports: [ConversationService],
  imports: [TypeOrmModule.forFeature([Conversation])],
  providers: [ConversationService],
})
export class ConversationModule {}
