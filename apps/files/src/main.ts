import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { microservices } from '@repo/rabbitmq-config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
  const port = configService.get<number>('PORT') || 3003;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.connectMicroservice(
    microservices.FILES_SERVICE({
      RABBITMQ_URL: rabbitmqUrl,
    }),
  );

  await app.startAllMicroservices();

  app.enableCors();
  await app.listen(port);

  console.log(`Files service HTTP listening on port ${port}`);
  console.log(`Files service RabbitMQ connected`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
