import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Login, Register, UserDTO } from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private static readonly REVOKED_TOKEN_PREFIX = 'revoked_token:';

  constructor(
    private readonly jwtService: JwtService,
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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
      this.coreService.send<UserDTO>('core.user.create', {
        ...register,
      }),
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
    await this.assertTokenNotRevoked(token);
    return await this.jwtService.verifyAsync<{ sub: number }>(token);
  }

  async logout(token: string): Promise<{ success: boolean }> {
    const payload = await this.jwtService.verifyAsync<{ exp?: number }>(token);
    const ttlMs = this.getTtlFromExp(payload.exp);

    if (ttlMs > 0) {
      await this.cacheManager.set(this.getRevokedTokenKey(token), '1', ttlMs);
    }

    return { success: true };
  }

  extractTokenFromHeader(authorization: string): string {
    return authorization.split(' ')[1] ?? '';
  }

  private getRevokedTokenKey(token: string): string {
    return `${AuthService.REVOKED_TOKEN_PREFIX}${token}`;
  }

  private async assertTokenNotRevoked(token: string): Promise<void> {
    const revoked = await this.cacheManager.get<string>(
      this.getRevokedTokenKey(token),
    );

    if (revoked) {
      throw new UnauthorizedException('Token révoqué');
    }
  }

  private getTtlFromExp(exp?: number): number {
    if (!exp) {
      return 0;
    }

    return Math.max(0, exp * 1000 - Date.now());
  }
}
