import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinksModule } from './links/links.module';
import { MicroservicesModule } from './microservices/microservices.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  controllers: [AppController],
  imports: [LinksModule, MicroservicesModule, GatewayModule],
  providers: [AppService],
})
export class AppModule {}
