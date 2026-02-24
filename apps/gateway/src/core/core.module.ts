import { Module } from '@nestjs/common';
import { CoreController } from './core.controller';
import { UserController } from './user/user.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';
import { CompanyController } from './company/company.controller';

@Module({
  controllers: [CoreController, UserController, CompanyController],
  imports: [
    ClientsModule.registerAsync([
      {
        name: microservices.symbols.CORE_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return microservices.CORE_SERVICE({
            RABBITMQ_URL: configService.get<string>('RABBITMQ_URL'),
          });
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class CoreModule {}
