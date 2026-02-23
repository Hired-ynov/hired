import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { LoginDTO, RegisterDTO, Login, Register } from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(microservices.symbols.AUTH_SERVICE)
    private readonly authService: ClientProxy,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    const login = plainToInstance(Login, loginDto);
    return firstValueFrom(this.authService.send('auth.auth.login', login));
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDTO) {
    const register = plainToInstance(Register, registerDto);
    return firstValueFrom(
      this.authService.send('auth.auth.register', register),
    );
  }

  @Post('verify')
  async verifyToken(@Body() data: { token: string }) {
    return firstValueFrom(this.authService.send('auth.auth.verify', data));
  }
}
