import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDTO, Role } from '@repo/models';
import {
  BaseService,
  PaginationOptions,
  PaginationResult,
  RabbitMQException,
} from '@repo/nest-service';
import { microservices } from '@repo/rabbitmq-config';
import { Subject, Observable } from 'rxjs';
import { Repository } from 'typeorm';

import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessageService extends BaseService<Message> {
  private readonly streams = new Map<string, Subject<Message>>();

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreClient: ClientProxy,
    @Inject(microservices.symbols.COMMUNICATION_SERVICE)
    private readonly communicationClient: ClientProxy,
  ) {
    super(messageRepository);
  }

  async createMessage(
    message: Message,
    currentUser: UserDTO,
  ): Promise<Message> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: message.conversationId },
      });

      if (!conversation) {
        throw new RabbitMQException(
          HttpStatus.NOT_FOUND,
          'Conversation not found',
        );
      }

      if (
        !currentUser.role.includes(Role.admin) &&
        !conversation.participants.includes(currentUser.id)
      ) {
        throw new RabbitMQException(
          HttpStatus.NOT_FOUND,
          'Conversation not found',
        );
      }

      message.senderId = currentUser.id;
      message.conversationId = conversation.id;

      const created = await this.create(message);

      const subj = this.streams.get(created.conversationId);

      console.log('Message created:', created);
      console.log(
        subj
          ? 'Emitting to stream subscribers'
          : 'No stream subscribers to emit to',
      );

      if (subj) subj.next(created);

      // also emit on internal bus for other subscribers
      try {
        this.communicationClient.emit('communication.message.created', created);
      } catch {
        // ignore internal bus failures
      }

      return created;
    } catch (error) {
      if (error instanceof RabbitMQException) throw error;

      console.error('Error creating message:', error);

      throw new RabbitMQException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'An error occurred while creating the message',
      );
    }
  }

  async findMessages(
    conversationId: string,
    page: PaginationOptions,
  ): Promise<PaginationResult<Message>> {
    return await this.findWithPagination(page, {
      order: { createdAt: 'DESC' },
      where: { conversationId },
    });
  }

  getMessageStream(conversationId: string): Observable<Message> {
    let subj = this.streams.get(conversationId);
    if (!subj) {
      subj = new Subject<Message>();
      this.streams.set(conversationId, subj);
    }
    return subj.asObservable();
  }
}
