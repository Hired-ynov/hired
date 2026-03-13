import { UserDTO } from '@repo/models';

export enum AuthType {
  LOGIN = 'login',
  REGISTER = 'register',
}

export type AuthContextType = {
  user: UserDTO | null;
  setUser: (user: UserDTO | null) => void;
  isCheckingAuth: boolean;
};
