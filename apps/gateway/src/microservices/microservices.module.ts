import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        ...microservices.AUTH_SERVICE,
      },
      {
        name: 'API_SERVICE',
        ...microservices.API_SERVICE,
      },
      {
        name: 'COMMUNICATION_SERVICE',
        ...microservices.COMMUNICATION_SERVICE,
      },
      {
        name: 'CORE_SERVICE',
        ...microservices.CORE_SERVICE,
      },
      {
        name: 'FILES_SERVICE',
        ...microservices.FILES_SERVICE,
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroservicesModule {}
