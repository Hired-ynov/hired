import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

@Module({
  controllers: [FilesController],
  imports: [
    ClientsModule.registerAsync([
      {
        name: microservices.symbols.FILES_SERVICE,
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
export class FilesModule {}
