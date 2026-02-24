import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: microservices.symbols.CORE_SERVICE,
        useFactory: (configService: ConfigService) => {
          return microservices.CORE_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
      },
    ]),
  ],
  providers: [AuthService],
})
export class AuthModule {}
