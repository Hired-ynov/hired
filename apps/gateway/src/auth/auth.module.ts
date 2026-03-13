import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: microservices.symbols.AUTH_SERVICE,
        useFactory: (configService: ConfigService) => {
          return microservices.AUTH_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
      },
    ]),
  ],
})
export class AuthModule {}
