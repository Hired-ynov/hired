import { NestFactory } from '@nestjs/core';
import { microservices } from '@repo/rabbitmq-config';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllRpcExceptionsFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter pour RPC
  app.useGlobalFilters(new AllRpcExceptionsFilter());

  app.connectMicroservice(
    microservices.AUTH_SERVICE({
      RABBITMQ_URL: rabbitmqUrl,
    }),
  );

  await app.startAllMicroservices();
  console.log('🚀 Auth microservice is running');
}

void bootstrap();
