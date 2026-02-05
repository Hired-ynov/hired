import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

@Module({
  controllers: [AuthController],
  imports: [
    ClientsModule.registerAsync([
      {
        name: microservices.symbols.AUTH_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return microservices.AUTH_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class AuthModule {}
