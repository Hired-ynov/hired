import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Login, Register } from '@repo/models';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.auth.login')
  async signIn(@Payload() login: Login): Promise<{ access_token: string }> {
    return await this.authService.login(login);
  }

  @MessagePattern('auth.auth.register')
  async register(
    @Payload() register: Register,
  ): Promise<{ access_token: string }> {
    return await this.authService.register(register);
  }

  @MessagePattern('auth.auth.verify')
  async verifyToken(
    @Payload() data: { token: string },
  ): Promise<{ sub: number }> {
    return await this.authService.verifyToken(data.token);
  }

  @MessagePattern('auth.auth.logout')
  async logout(
    @Payload() data: { token: string },
  ): Promise<{ success: boolean }> {
    return await this.authService.logout(data.token);
  }
}
