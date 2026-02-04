import { Module } from '@nestjs/common';
import { CommunicationController } from './communication.controller';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatController } from './chat/chat.controller';
import { microservices } from '@repo/rabbitmq-config';
import { COMMUNICATION_SERVICE } from '../constants/microservices.constants';

@Module({
  controllers: [CommunicationController, ChatController],
  imports: [
    ClientsModule.registerAsync([
      {
        name: COMMUNICATION_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return microservices.COMMUNICATION_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class CommunicationModule {}
