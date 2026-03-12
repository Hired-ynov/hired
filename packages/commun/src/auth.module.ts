import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { AuthGuard } from './guard/auth.guard';

type JwtExpiresIn = NonNullable<
  NonNullable<JwtModuleOptions['signOptions']>['expiresIn']
>;
export interface AuthModuleOptions {
  jwtExpiresIn?: JwtExpiresIn;
  jwtSecret?: string;
  useConfigService?: boolean;
}

@Module({})
export class AuthSharedModule {
  static forRoot(options?: AuthModuleOptions): DynamicModule {
    const {
      jwtExpiresIn = '1d',
      jwtSecret,
      useConfigService = true,
    } = options ?? {};

    return {
      exports: [AuthGuard, JwtModule],
      global: true,
      imports: [
        useConfigService
          ? JwtModule.registerAsync({
              global: true,
              inject: [ConfigService],
              useFactory: (configService: ConfigService): JwtModuleOptions => ({
                secret: configService.get<string>('JWT_SECRET') ?? jwtSecret,
                signOptions: { expiresIn: jwtExpiresIn },
              }),
            })
          : JwtModule.register({
              global: true,
              secret: jwtSecret,
              signOptions: { expiresIn: jwtExpiresIn },
            }),
      ],
      module: AuthSharedModule,
      providers: [AuthGuard],
    };
  }
}
