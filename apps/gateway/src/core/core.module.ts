import { Module } from '@nestjs/common';
import { CoreController } from './core.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

@Module({
  controllers: [CoreController],
  imports: [
    ClientsModule.registerAsync([
      {
        name: microservices.symbols.CORE_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return microservices.CORE_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class CoreModule {}
