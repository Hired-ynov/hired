import { UserDTO } from '@repo/models';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request & { user: UserDTO } = ctx
      .switchToHttp()
      .getRequest();

    const user = request.user;
    user.id = (user as UserDTO & { sub: string }).sub; // map sub to id for consistency
    return user;
  },
);
