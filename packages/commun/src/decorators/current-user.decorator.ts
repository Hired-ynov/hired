import { UserDTO } from '@repo/models';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request & { user: UserDTO } = ctx
      .switchToHttp()
      .getRequest();
    return request.user;
  },
);
