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
import { firstValueFrom, map, timeout } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import {
  MessageDTO,
  PaginationOptions,
  PaginationResult,
  ConversationDTO,
  CreateConversationDTO,
  UserDTO,
  Message,
} from '@repo/models';
import { CurrentUser } from '@repo/nest-service';

@Controller('chat')
export class ChatController {
  constructor(
    @Inject(microservices.symbols.COMMUNICATION_SERVICE)
    private readonly communicationService: ClientProxy,
    @Inject(microservices.symbols.INTERNAL_BUS_SERVICE)
    private readonly internalService: ClientProxy<{
      'communication.message.created': (payload: Message) => void;
    }>,
  ) {}

  @Sse('/:id/messages/stream')
  streamMessages(@Param('id') chatId: string) {
    if (!chatId) {
      throw new BadRequestException('chat id is required');
    } // keep the SSE open and proxy the internal message stream

    return this.internalService
      .send('communication.message.created', { conversationId: chatId })
      .pipe(map((payload) => ({ data: payload })));
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
