'use client';

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserDTO } from '@repo/models';
import { AuthContextType } from './types';
import authClient from './authClient';
import { getAuthToken } from '../api';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsCheckingAuth(true);
        if (!getAuthToken()) {
          setUser(null);
          return;
        }
        const data = await authClient.me();
        if (data) {
          setUser(data);
        }
      } catch (err) {
        console.error('Unexpected error checking auth:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isCheckingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
