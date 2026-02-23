import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDTO, RegisterDTO } from '@repo/models';
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
  async login(@Body() logtinDto: LoginDTO) {
    return this.authService.send('auth.auth.login', logtinDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDTO) {
    return this.authService.send('auth.auth.register', registerDto);
  }

  @Post('verify')
  async verifyToken(@Body() data: { token: string }) {
    return this.authService.send('auth.auth.verify', data);
  }
}
