import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessageDTO, CreateMessageDTO, UserDTO } from '@repo/models';
import { plainToInstance } from 'class-transformer';
import { map } from 'rxjs/operators';

import { Message } from '../entities/message.entity';

import { MessageService } from './message.service';
import { PaginationOptions, PaginationResult } from '@repo/nest-service';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @MessagePattern('communication.message.findAll')
  async findAll(
    @Payload()
    data: {
      conversationId: string;
      page: PaginationOptions;
    },
  ): Promise<PaginationResult<MessageDTO>> {
    const { conversationId, page } = data;

    const result = await this.messageService.findMessages(conversationId, page);

    return {
      ...result,
      data: plainToInstance(MessageDTO, result.data),
    };
  }

  @MessagePattern('communication.message.create')
  async createMessage(
    @Payload()
    data: {
      conversationId: string;
      message: CreateMessageDTO;
      currentUser: UserDTO;
    },
  ): Promise<MessageDTO> {
    const { conversationId, currentUser, message: messageDto } = data;

    const messageInput = plainToInstance(Message, {
      content: messageDto.content,
      conversationId,
    });

    const created = await this.messageService.createMessage(
      messageInput,
      currentUser,
    );

    return plainToInstance(MessageDTO, created);
  }

  @MessagePattern('communication.message.created')
  messageCreated(@Payload() data: { conversationId: string }) {
    const { conversationId } = data;
    return this.messageService
      .getMessageStream(conversationId)
      .pipe(map((m) => plainToInstance(MessageDTO, m)));
  }
}
