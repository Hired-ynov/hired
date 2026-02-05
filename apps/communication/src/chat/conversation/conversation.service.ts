import {
  NotFoundException,
  Injectable,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Offer,
  PaginationOptions,
  PaginationResult,
  Role,
  UserDTO,
} from '@repo/models';
import { BaseService, RabbitMQException } from '@repo/nest-service';
import { microservices } from '@repo/rabbitmq-config';
import { firstValueFrom, timeout } from 'rxjs';
import { ArrayContains, Repository } from 'typeorm';

import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class ConversationService extends BaseService<Conversation> {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @Inject(microservices.symbols.INTERNAL_BUS_SERVICE)
    private readonly internalBusClient: ClientProxy,
  ) {
    super(conversationRepository);
  }

  async createConversation(
    conversation: Conversation,
    currentUser: UserDTO,
  ): Promise<Conversation> {
    try {
      const offer = await firstValueFrom<Offer | undefined>(
        this.internalBusClient
          .send('core.offers.findOne', { id: conversation.offerId })
          .pipe(timeout(1000)),
      );

      if (!offer) {
        throw new NotFoundException('Offer not found');
      }

      const selfUser = await firstValueFrom<UserDTO | undefined>(
        this.internalBusClient
          .send('core.users.findOne', { id: currentUser.id })
          .pipe(timeout(1000)),
      );

      const remoteUser = await firstValueFrom<UserDTO | undefined>(
        this.internalBusClient
          .send('core.users.findOne', { companyId: offer.companyId })
          .pipe(timeout(1000)),
      );

      if (!selfUser || !remoteUser) {
        throw new NotFoundException('User(s) not found');
      }

      conversation.offerId = offer.id;
      conversation.participants = [selfUser.id, remoteUser.id];

      return await this.create(conversation);
    } catch (error) {
      // client throw
      if (error instanceof NotFoundException) {
        throw new RabbitMQException(HttpStatus.NOT_FOUND, error.message);
      }

      // revert
      this.remove(conversation.id).catch(() => void 0);

      // server throw
      throw new RabbitMQException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'An error occurred while creating the conversation',
      );
    }
  }

  async findAllConversation(
    page: PaginationOptions,
    currentUser: UserDTO,
  ): Promise<PaginationResult<Conversation>> {
    return await this.findWithPagination(page, {
      where: [
        {
          participants: ArrayContains([currentUser.id]),
        },
      ],
    });
  }

  async findConversation(
    id: string,
    currentUser: UserDTO,
  ): Promise<Conversation | null> {
    const conversation = await this.findOne({
      id,
    });

    if (
      !currentUser.role.includes(Role.admin) &&
      !conversation?.participants.includes(currentUser.id)
    ) {
      throw new RabbitMQException(
        HttpStatus.NOT_FOUND,
        'Conversation not found',
      );
    }

    return conversation;
  }

  async removeConversation(id: string, currentUser: UserDTO): Promise<void> {
    const conversation = await this.findOne({
      id,
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

    await this.conversationRepository.delete(id);
  }
}
