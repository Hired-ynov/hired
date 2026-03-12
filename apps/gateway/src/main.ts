import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { RpcToHttpExceptionFilter } from './filters/rpc-to-http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  // Global exception filter pour convertir RPC exceptions en HTTP
  app.useGlobalFilters(new RpcToHttpExceptionFilter());

  await app.listen(3000);

  console.log(`🚀 Gateway is running on: http://localhost:3000`);
  console.log(`🐰 RabbitMQ connection established`);
}

void bootstrap();
