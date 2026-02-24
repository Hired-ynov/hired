import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guard/auth.guard';

export interface AuthModuleOptions {
  jwtSecret?: string;
  jwtExpiresIn?: string | number;
  useConfigService?: boolean;
}

@Module({})
export class AuthSharedModule {
  static forRoot(options?: AuthModuleOptions): DynamicModule {
    const {
      jwtSecret,
      jwtExpiresIn = '1d',
      useConfigService = true,
    } = options || {};

    return {
      module: AuthSharedModule,
      global: true,
      imports: [
        useConfigService
          ? JwtModule.registerAsync({
              global: true,
              inject: [ConfigService],
              useFactory: (configService: ConfigService): JwtModuleOptions => ({
                secret: configService.get<string>('JWT_SECRET') || jwtSecret,
                signOptions: { expiresIn: jwtExpiresIn as any },
              }),
            })
          : JwtModule.register({
              global: true,
              secret: jwtSecret,
              signOptions: { expiresIn: jwtExpiresIn as any },
            }),
      ],
      providers: [AuthGuard],
      exports: [AuthGuard, JwtModule],
    };
  }
}
