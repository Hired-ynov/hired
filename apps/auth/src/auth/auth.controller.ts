import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
  Get,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginDTO, RegisterDTO, Role } from '@repo/models';
import { REQUEST } from '@nestjs/core';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  @Post('login')
  async signIn(@Body() login: LoginDTO): Promise<{ access_token: string }> {
    const user = await this.userService.findOne({ email: login.email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.userService.verifyPassword(
      login.password,
      user.passwordHash || '',
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
      access_token: await this.authService.generateToken(payload),
    };
  }

  @Post('register')
  async register(
    @Body() register: RegisterDTO,
  ): Promise<{ access_token: string }> {
    try {
      const existingUser = await this.userService.findOne({
        email: register.email,
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const emptyUsers = (await this.userService.findAll()).length === 0;
      const passwordHash = await this.userService.generatePasswordHash(
        register.password,
      );

      const user = await this.userService.create({
        ...register,
        passwordHash,
        role: emptyUsers ? Role.admin : Role.user,
        skills: [],
        location: null as unknown as string,
      });

      const payload = {
        sub: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      };

      return {
        access_token: await this.authService.generateToken(payload),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  @Get('me')
  async getUserFromToken() {
    try {
      const headers =
        (this.request.headers as unknown as Record<string, string>) || {};
      const authorization = headers.authorization || '';
      const token = this.authService.extractTokenFromHeader(authorization);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.authService.verifyToken(token);
      const user = await this.userService.findById(payload.sub.toString());

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
