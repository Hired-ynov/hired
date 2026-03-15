import {
  Body,
  Controller,
  Headers,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@repo/commun';
import { LoginDTO, RegisterDTO } from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
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
    return firstValueFrom(
      this.authService.send<{ access_token: string }>(
        'auth.auth.login',
        loginDto,
      ),
    );
  }

  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiResponse({ description: 'Inscription réussie', status: 201 })
  @Post('register')
  @Public()
  async register(
    @Body() registerDto: RegisterDTO,
  ): Promise<{ access_token: string }> {
    return firstValueFrom(
      this.authService.send<{ access_token: string }>(
        'auth.auth.register',
        registerDto,
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

  @ApiOperation({ summary: 'Déconnexion utilisateur' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ description: 'Déconnexion réussie', status: 201 })
  @Post('logout')
  async logout(
    @Headers('authorization') authorization?: string,
  ): Promise<{ success: boolean }> {
    const token = this.extractBearerToken(authorization);

    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    return firstValueFrom(
      this.authService.send<{ success: boolean }>('auth.auth.logout', {
        token,
      }),
    );
  }

  private extractBearerToken(authorization?: string): string | undefined {
    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
