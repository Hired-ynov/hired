import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@repo/commun';
import { LoginDTO, RegisterDTO, Login, Register } from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(microservices.symbols.AUTH_SERVICE)
    private readonly authService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ description: 'Connexion réussie', status: 201 })
  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDTO): Promise<{ access_token: string }> {
    const login = plainToInstance(Login, loginDto);
    return firstValueFrom(
      this.authService.send<{ access_token: string }>('auth.auth.login', login),
    );
  }

  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiResponse({ description: 'Inscription réussie', status: 201 })
  @Post('register')
  @Public()
  async register(
    @Body() registerDto: RegisterDTO,
  ): Promise<{ access_token: string }> {
    const register = plainToInstance(Register, registerDto);
    return firstValueFrom(
      this.authService.send<{ access_token: string }>(
        'auth.auth.register',
        register,
      ),
    );
  }

  @ApiOperation({ summary: "Vérification du token de l'utilisateur" })
  @ApiResponse({ description: 'Vérification validée', status: 201 })
  @Post('verify')
  @Public()
  async verifyToken(@Body() data: { token: string }): Promise<{ sub: number }> {
    return firstValueFrom(
      this.authService.send<{ sub: number }>('auth.auth.verify', data),
    );
  }
}
