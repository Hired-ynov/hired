import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { rabbitmqConfig } from '@repo/rabbitmq-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS
  app.enableCors();

  // Connect to RabbitMQ as a hybrid application
  app.connectMicroservice<RmqOptions>(rabbitmqConfig);

  await app.startAllMicroservices();
  await app.listen(3000);

  console.log(`🚀 Gateway is running on: http://localhost:3000`);
  console.log(`🐰 RabbitMQ connection established`);
}

void bootstrap();
