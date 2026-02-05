import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationDTO, CreateConversationDTO, UserDTO } from '@repo/models';
import { plainToInstance } from 'class-transformer';

import { Conversation } from '../entities/conversation.entity';

import { ConversationService } from './conversation.service';

@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @MessagePattern('communication.conversation.create')
  async createConversation(
    @Payload()
    data: {
      currentUser: UserDTO;
      conversation: CreateConversationDTO;
    },
  ): Promise<ConversationDTO> {
    const { conversation: conversationDto, currentUser: userDto } = data;

    const conversationInput = plainToInstance(Conversation, conversationDto);

    const result = await this.conversationService.createConversation(
      conversationInput,
      userDto,
    );

    return plainToInstance(ConversationDTO, result);
  }
}
