import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDTO } from '@repo/models';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request & { user: UserDTO } = ctx
      .switchToHttp()
      .getRequest();
    return request.user;
  },
);
