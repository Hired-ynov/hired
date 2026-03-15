import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  CanActivate,
  ExecutionContext,
  Injectable,
  Optional,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@repo/models';
import { Cache } from 'cache-manager';

interface JwtPayload extends Record<string, unknown> {
  role?: Role;
}

interface HttpRequest {
  headers?: Record<string, string | string[] | undefined>;
  user?: JwtPayload;
}

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class AuthGuard implements CanActivate {
  private static readonly REVOKED_TOKEN_PREFIX = 'revoked_token:';

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @Optional()
    @Inject(CACHE_MANAGER)
    private readonly cacheManager?: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<HttpRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    let payload: JwtPayload;
    try {
      await this.assertTokenNotRevoked(token);
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
    if (payload.role === Role.admin) {
      return true;
    }
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) {
      requiredRoles.push(Role.user);
    }

    if (!payload.role || !requiredRoles.includes(payload.role)) {
      throw new UnauthorizedException(
        `Rôle requis: ${requiredRoles.join(', ')}, rôle actuel: ${String(payload.role)}`,
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: HttpRequest): string | undefined {
    const authorizationHeader = request.headers?.authorization;
    const authorization = Array.isArray(authorizationHeader)
      ? authorizationHeader[0]
      : authorizationHeader;

    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private async assertTokenNotRevoked(token: string): Promise<void> {
    if (!this.cacheManager) {
      return;
    }

    const revoked = await this.cacheManager.get<string>(
      `${AuthGuard.REVOKED_TOKEN_PREFIX}${token}`,
    );

    if (revoked) {
      throw new UnauthorizedException('Token révoqué');
    }
  }
}
