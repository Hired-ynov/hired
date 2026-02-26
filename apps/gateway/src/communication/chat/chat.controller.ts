/* eslint-disable import-x/order */
import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  BadRequestException,
  Post,
  Body,
  Delete,
  Sse,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';
import { firstValueFrom, map, Observable, timeout } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import {
  MessageDTO,
  ConversationDTO,
  CreateConversationDTO,
  UserDTO,
  Message,
} from '@repo/models';
import { PaginationOptions, PaginationResult } from '@repo/nest-service';
import { CurrentUser } from '@repo/commun';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('chat')
@ApiBearerAuth()
export class ChatController {
  constructor(
    @Inject(microservices.symbols.COMMUNICATION_SERVICE)
    private readonly communicationService: ClientProxy<{
      'communication.message.created': (message: Message) => void;
    }>,
  ) {}

  @Sse('/:id/messages/stream')
  streamMessages(@Param('id') chatId: string) {
    if (!chatId) {
      throw new BadRequestException('chat id is required');
    } // keep the SSE open and proxy the internal message stream
    // request a message stream for this conversation from the communication service
    const payload = { conversationId: chatId };
    return this.communicationService
      .send<MessageDTO>('communication.message.created', payload)
      .pipe(map((message) => ({ data: plainToInstance(MessageDTO, message) })));
  }

  @Get('/:id/messages')
  async getMessages(
    @Param('id') chatId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ): Promise<PaginationResult<MessageDTO>> {
    if (!chatId) {
      throw new BadRequestException('chat id is required');
    }

    const payload = {
      conversationId: chatId,
      page: { limit, page } as PaginationOptions,
    };

    const response = await firstValueFrom(
      this.communicationService
        .send<
          PaginationResult<MessageDTO>
        >('communication.message.findAll', payload)
        .pipe(timeout(5000)),
    );

    return {
      ...response,
      data: plainToInstance(MessageDTO, response.data),
    };
  }

  @Post('/:id/messages')
  @ApiBody({ type: MessageDTO })
  async createMessage(
    @Param('id') chatId: string,
    @Body() message: Partial<MessageDTO>,
    @CurrentUser() currentUser?: UserDTO,
  ): Promise<MessageDTO> {
    if (!chatId) {
      throw new BadRequestException('chat id is required');
    }

    if (!message || !message.content) {
      throw new BadRequestException('message content is required in body');
    }

    if (!currentUser) {
      throw new BadRequestException('currentUser is required');
    }

    const messageDto = plainToInstance(MessageDTO, {
      ...message,
      conversationId: chatId,
    });

    const response = await firstValueFrom(
      this.communicationService
        .send<MessageDTO>('communication.message.create', {
          message: messageDto,
          currentUser,
        })
        .pipe(timeout(5000)),
    );

    return plainToInstance(MessageDTO, response);
  }

  @Post('/conversations')
  async createConversation(
    @Body() conversation?: CreateConversationDTO,
    @CurrentUser() currentUser?: UserDTO,
  ): Promise<ConversationDTO> {
    if (!conversation) {
      throw new BadRequestException('conversation is required in body');
    }

    if (!currentUser) {
      throw new BadRequestException('currentUser is required');
    }

    const conversationDto = plainToInstance(
      CreateConversationDTO,
      conversation,
    );

    const response = await firstValueFrom(
      this.communicationService
        .send<ConversationDTO>('communication.conversation.create', {
          conversation: conversationDto,
          currentUser,
        })
        .pipe(timeout(5000)),
    );

    return plainToInstance(ConversationDTO, response);
  }

  @Get('/conversations')
  async findAllConversations(
    @CurrentUser() currentUser?: UserDTO,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ): Promise<PaginationResult<ConversationDTO>> {
    if (!currentUser) {
      throw new BadRequestException('currentUser is required');
    }

    const payload = { currentUser, page: { limit, page } as PaginationOptions };

    const response = await firstValueFrom(
      this.communicationService
        .send<
          PaginationResult<ConversationDTO>
        >('communication.conversation.findAll', payload)
        .pipe(timeout(5000)),
    );

    return {
      ...response,
      data: plainToInstance(ConversationDTO, response.data),
    };
  }

  @Get('/conversations/:id')
  async findConversation(
    @Param('id') id: string,
    @CurrentUser() currentUser?: UserDTO,
  ): Promise<ConversationDTO | null> {
    if (!currentUser) {
      throw new BadRequestException('currentUser is required');
    }

    const response = await firstValueFrom(
      this.communicationService
        .send<ConversationDTO | null>('communication.conversation.findOne', {
          currentUser,
          id,
        })
        .pipe(timeout(5000)),
    );

    if (!response) return null;
    return plainToInstance(ConversationDTO, response);
  }

  @Delete('/conversations/:id')
  async removeConversation(
    @Param('id') id: string,
    @CurrentUser() currentUser?: UserDTO,
  ): Promise<void> {
    if (!currentUser) {
      throw new BadRequestException('currentUser is required');
    }

    await firstValueFrom(
      this.communicationService
        .send<unknown>('communication.conversation.remove', { currentUser, id })
        .pipe(timeout(5000)),
    );
  }
}
