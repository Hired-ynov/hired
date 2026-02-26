import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from '@repo/commun';
import { LoginDTO, RegisterDTO, Login, Register } from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(microservices.symbols.AUTH_SERVICE)
    private readonly authService: ClientProxy,
  ) {}

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDTO): Promise<{ access_token: string }> {
    const login = plainToInstance(Login, loginDto);
    return firstValueFrom(
      this.authService.send<{ access_token: string }>('auth.auth.login', login),
    );
  }

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

  @Post('verify')
  @Public()
  async verifyToken(@Body() data: { token: string }): Promise<{ sub: number }> {
    return firstValueFrom(
      this.authService.send<{ sub: number }>('auth.auth.verify', data),
    );
  }
}
