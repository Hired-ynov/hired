import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(microservices.symbols.AUTH_SERVICE)
    private readonly authService: ClientProxy,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}
}
