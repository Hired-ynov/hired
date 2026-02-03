import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS
  app.enableCors();

  await app.listen(3000);

  console.log(`🚀 Gateway is running on: http://localhost:3000`);
  console.log(`🐰 RabbitMQ connection established`);
}

void bootstrap();
