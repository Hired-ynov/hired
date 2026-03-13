'use client';

import React, { useEffect, useState } from 'react';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

import { AuthType } from '@/lib/auth/types';

interface AuthModalProps {
  initialMode?: AuthType;
  onClose: () => void;
  open: boolean;
}

export default function AuthModal({
  initialMode = AuthType.LOGIN,
  onClose,
  open,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthType>(initialMode);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-lg w-[380px] max-w-[calc(100%-32px)] p-6 shadow-lg"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="relative flex items-center justify-center mb-3">
          <div className="text-lg font-semibold text-[var(--text-primary)]">
            {mode === 'register' ? "S'inscrire" : 'Se connecter'}
          </div>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            onClick={onClose}
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div>
          {mode === AuthType.LOGIN && (
            <LoginForm onClose={onClose} setMode={setMode} />
          )}
          {mode === AuthType.REGISTER && (
            <RegisterForm onClose={onClose} setMode={setMode} />
          )}
        </div>
      </div>
    </div>
  );
}
