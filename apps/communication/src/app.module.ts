import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationModule } from './chat/conversation/conversation.module';
import { Conversation } from './chat/entities/conversation.entity';
import { Message } from './chat/entities/message.entity';
import { MessageModule } from './chat/message/message.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        database: configService.get('POSTGRES_DB'),
        entities: [Conversation, Message],
        host: configService.get('POSTGRES_HOST'),
        password: configService.get('POSTGRES_PASSWORD'),
        port: configService.get<number>('POSTGRES_PORT'),
        synchronize: configService.get('NODE_ENV') !== 'production',
        type: 'postgres',
        username: configService.get('POSTGRES_USER'),
      }),
    }),
    MessageModule,
    ConversationModule,
  ],
  providers: [AppService],
})
export class AppModule {}
