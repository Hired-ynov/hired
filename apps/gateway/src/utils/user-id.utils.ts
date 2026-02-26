import { UserDTO } from '@repo/models';

export function getUserId(user: { id: string; sub?: number }): string {
  return (user as UserDTO & { sub?: number }).sub?.toString() ?? user.id;
}
