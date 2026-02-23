import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Login, Register } from '@repo/models';
import { MessagePattern, Payload } from '@nestjs/microservices';

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
}
