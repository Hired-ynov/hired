import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Login, Register, UserDTO } from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

  async login(login: Login): Promise<{ access_token: string }> {
    const user = await firstValueFrom(
      this.coreService.send<UserDTO | null>(
        'core.user.find-one-by-email-with-password',
        {
          email: login.email,
        },
      ),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await firstValueFrom(
      this.coreService.send<boolean>('core.user.verify-password', {
        password: login.password,
        passwordHash: user.passwordHash ?? '',
      }),
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      sub: user.id,
    };

    return {
      access_token: await this.generateToken(payload),
    };
  }

  async register(register: Register): Promise<{ access_token: string }> {
    const user = await firstValueFrom(
      this.coreService.send<UserDTO>(
        'core.user.create',
        Object.assign({}, register, {
          location: null,
          role: null,
          skills: [],
        }),
      ),
    );

    const payload = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      sub: user.id,
    };

    return {
      access_token: await this.generateToken(payload),
    };
  }

  async generateToken(payload: {
    sub: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<{ sub: number }> {
    return await this.jwtService.verifyAsync<{ sub: number }>(token);
  }

  extractTokenFromHeader(authorization: string): string {
    return authorization.split(' ')[1] ?? '';
  }
}
