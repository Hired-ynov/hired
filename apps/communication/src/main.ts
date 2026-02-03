import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { microservices } from '@repo/rabbitmq-config';

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

void bootstrap();
