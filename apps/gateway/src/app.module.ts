import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommunicationModule } from './communication/communication.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { FilesModule } from './files/files.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CommunicationModule,
    AuthModule,
    CoreModule,
    FilesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
