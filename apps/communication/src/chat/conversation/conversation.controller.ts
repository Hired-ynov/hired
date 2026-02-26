import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationDTO, CreateConversationDTO, UserDTO } from '@repo/models';
import { plainToInstance } from 'class-transformer';

import { Conversation } from '../entities/conversation.entity';

import { ConversationService } from './conversation.service';
import { PaginationOptions, PaginationResult } from '@repo/nest-service';

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

  @MessagePattern('communication.conversation.findAll')
  async findAllConversation(
    @Payload()
    data: {
      page: PaginationOptions;
      currentUser: UserDTO;
    },
  ): Promise<PaginationResult<ConversationDTO>> {
    const { currentUser, page } = data;

    const result = await this.conversationService.findAllConversation(
      page,
      currentUser,
    );

    return {
      ...result,
      data: plainToInstance(ConversationDTO, result.data),
    };
  }

  @MessagePattern('communication.conversation.findOne')
  async findConversation(
    @Payload()
    data: {
      id: string;
      currentUser: UserDTO;
    },
  ): Promise<ConversationDTO | null> {
    const { currentUser, id } = data;

    const conversation = await this.conversationService.findConversation(
      id,
      currentUser,
    );

    if (!conversation) {
      return null;
    }

    return plainToInstance(ConversationDTO, conversation);
  }

  @MessagePattern('communication.conversation.remove')
  async removeConversation(
    @Payload()
    data: {
      id: string;
      currentUser: UserDTO;
    },
  ): Promise<void> {
    const { currentUser, id } = data;

    await this.conversationService.removeConversation(id, currentUser);
  }
}
