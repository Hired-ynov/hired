import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { LoginDTO, RegisterDTO, Login, Register } from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { Public } from '@repo/commun';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(microservices.symbols.AUTH_SERVICE)
    private readonly authService: ClientProxy,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 201, description: 'Connexion réussie' })
  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDTO) {
    const login = plainToInstance(Login, loginDto);
    return firstValueFrom(this.authService.send('auth.auth.login', login));
  }

  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiResponse({ status: 201, description: 'Inscription réussie' })
  @Post('register')
  @Public()
  async register(@Body() registerDto: RegisterDTO) {
    const register = plainToInstance(Register, registerDto);
    return firstValueFrom(
      this.authService.send('auth.auth.register', register),
    );
  }

  @ApiOperation({ summary: "Vérification du token de l'utilisateur" })
  @ApiResponse({ status: 201, description: 'Vérification validée' })
  @Post('verify')
  @Public()
  async verifyToken(@Body() data: { token: string }) {
    return firstValueFrom(this.authService.send('auth.auth.verify', data));
  }
}
