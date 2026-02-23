import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';

import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  exports: [MessageService],
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
    TypeOrmModule.forFeature([Message, Conversation]),
  ],
  providers: [MessageService],
})
export class MessageModule {}
