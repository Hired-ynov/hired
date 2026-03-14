import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllRpcExceptionsFilter } from '@repo/nest-service';
import { microservices } from '@repo/rabbitmq-config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
  const port = configService.get<number>('PORT') ?? 3003;

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Files Service API')
    .setDescription('Microservice for handling file uploads and management')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.connectMicroservice(
    microservices.FILES_SERVICE({
      RABBITMQ_URL: rabbitmqUrl,
    }),
    {
      inheritAppConfig: true,
    },
  );

  await app.startAllMicroservices();

  app.enableCors();
  await app.listen(port);

  console.log(`Files service HTTP listening on port ${port}`);
  console.log(`Files service RabbitMQ connected`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
