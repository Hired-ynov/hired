import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO, RegisterDTO, Role } from '@repo/models';
import { ClientProxy } from '@nestjs/microservices';
import { microservices } from '@repo/rabbitmq-config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly coreService: ClientProxy,
  ) {}

  async login(login: LoginDTO): Promise<{ access_token: string }> {
    const user = await firstValueFrom(
      this.coreService.send('core.user.findOne', { email: login.email }),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await firstValueFrom(
      this.coreService.send('core.user.verifyPassword', {
        password: login.password,
        passwordHash: user.passwordHash || '',
      }),
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.generateToken(payload),
    };
  }

  async register(register: RegisterDTO): Promise<{ access_token: string }> {
    try {
      const existingUser = await firstValueFrom(
        this.coreService.send('core.user.findOne', { email: register.email }),
      );

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const allUsers = await firstValueFrom(
        this.coreService.send('core.user.findAll', {}),
      );
      const emptyUsers = allUsers.length === 0;

      const passwordHash = await firstValueFrom(
        this.coreService.send('core.user.generatePasswordHash', {
          password: register.password,
        }),
      );

      const user = await firstValueFrom(
        this.coreService.send('core.user.create', {
          ...register,
          passwordHash,
          role: emptyUsers ? Role.admin : Role.user,
          skills: [],
          location: null,
        }),
      );

      const payload = {
        sub: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      };

      return {
        access_token: await this.generateToken(payload),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
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
