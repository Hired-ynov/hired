/* eslint-disable perfectionist/sort-objects */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { microservices } from '@repo/rabbitmq-config';

import { Conversation } from '../entities/conversation.entity';

import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  controllers: [ConversationController],
  exports: [ConversationService],
  imports: [
    ClientsModule.registerAsync([
      {
        name: microservices.symbols.INTERNAL_BUS_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return microservices.INTERNAL_BUS_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
        inject: [ConfigService],
      },
    ]),
    TypeOrmModule.forFeature([Conversation]),
  ],
  providers: [ConversationService],
})
export class ConversationModule {}
