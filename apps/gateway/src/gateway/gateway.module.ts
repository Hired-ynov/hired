import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { MicroservicesModule } from '../microservices/microservices.module';

@Module({
  imports: [MicroservicesModule],
  controllers: [GatewayController],
})
export class GatewayModule {}
