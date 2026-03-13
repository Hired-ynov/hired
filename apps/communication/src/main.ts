import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { microservices } from '@repo/rabbitmq-config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
  app.connectMicroservice(
    microservices.COMMUNICATION_SERVICE({
      RABBITMQ_URL: rabbitmqUrl,
    }),
  );

  await app.startAllMicroservices();
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
