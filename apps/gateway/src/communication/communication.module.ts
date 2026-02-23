import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

import { ChatController } from './chat/chat.controller';
import { CommunicationController } from './communication.controller';

@Module({
  controllers: [CommunicationController, ChatController],
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: microservices.symbols.COMMUNICATION_SERVICE,
        useFactory: (configService: ConfigService) => {
          return microservices.COMMUNICATION_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
      },
    ]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: microservices.symbols.INTERNAL_BUS_SERVICE,
        useFactory: (configService: ConfigService) => {
          return microservices.INTERNAL_BUS_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
      },
    ]),
  ],
})
export class CommunicationModule {}
