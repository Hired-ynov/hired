import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { microservices } from '@repo/rabbitmq-config';

import { AppModule } from './app.module';
import { AllRpcExceptionsFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  // Global exception filter pour RPC
  app.useGlobalFilters(new AllRpcExceptionsFilter());

  app.connectMicroservice(
    microservices.AUTH_SERVICE({
      RABBITMQ_URL: rabbitmqUrl,
    }),
    {
      inheritAppConfig: true,
    },
  );

  await app.startAllMicroservices();
  console.log('🚀 Auth microservice is running');
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
