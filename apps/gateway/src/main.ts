import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RpcToHttpExceptionFilter } from './filters/rpc-to-http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter pour convertir RPC exceptions en HTTP
  app.useGlobalFilters(new RpcToHttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Example API')
    .setDescription('The API description')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(3000);

  console.log(`🚀 Gateway is running on: http://localhost:3000`);
  console.log(`🐰 RabbitMQ connection established`);
}

void bootstrap();
