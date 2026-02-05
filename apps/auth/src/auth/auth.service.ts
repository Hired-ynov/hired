import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

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
