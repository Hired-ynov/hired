import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProvider, ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

import { FilesController } from './files.controller';

@Module({
  controllers: [FilesController],
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: microservices.symbols.FILES_SERVICE,
        useFactory: (configService: ConfigService) => {
          return microservices.COMMUNICATION_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          }) as unknown as ClientProvider;
        },
      },
    ]),
  ],
})
export class FilesModule {}
