import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { microservices } from '@repo/rabbitmq-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService = app.get<ConfigService>(ConfigService);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
  app.connectMicroservice(
    microservices.CORE_SERVICE({
      RABBITMQ_URL: rabbitmqUrl,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(3000);
}

void bootstrap();
