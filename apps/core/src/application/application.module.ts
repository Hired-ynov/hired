import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationEntity } from './entities/application.entity';

@Module({
  controllers: [ApplicationController],
  exports: [ApplicationService],
  imports: [TypeOrmModule.forFeature([ApplicationEntity])],
  providers: [ApplicationService],
})
export class ApplicationModule {}
