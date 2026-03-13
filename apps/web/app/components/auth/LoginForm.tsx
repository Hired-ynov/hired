'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDTO } from '@repo/models';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import authClient from '../../../lib/auth/authClient';
import { useAuth } from '../../../lib/auth/authProvider';
import { LoginInput, loginSchema } from '../../../lib/auth/authSchema';
import { AuthType } from '../../../lib/auth/types';
import { handleAuthError } from '../../../lib/auth/utils';
import ClosedEye from '../../assets/ClosedEye';
import Eye from '../../assets/Eye';
import FormInput from '../form/FormInput';
import FormSubmitButton from '../form/FormSubmitButton';

interface LoginFormProps {
  onClose: () => void;
  setMode: (mode: AuthType) => void;
}

export default function LoginForm({ onClose, setMode }: LoginFormProps) {
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<LoginInput>({
    mode: 'onBlur',
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginInput) {
    const loginDTO: LoginDTO = {
      email: values.email,
      password: values.password,
    };

    try {
      await authClient.login(loginDTO);
      const user = await authClient.me();
      if (!user) {
        throw new Error('Failed to fetch user profile');
      }
      setUser(user);
      onClose();
      reset();
    } catch (error: unknown) {
      handleAuthError(error, AuthType.LOGIN);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        placeholder="Email"
        {...register('email')}
        error={errors.email?.message}
      />
      <FormInput
        placeholder="Mot de passe"
        {...register('password')}
        error={errors.password?.message}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          showPassword ? (
            <ClosedEye className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )
        }
        onRightIconClick={() => {
          setShowPassword((prev) => !prev);
        }}
      />
      <div className="flex flex-col items-center gap-3">
        <FormSubmitButton isSubmitting={isSubmitting} label="Se connecter" />
        <div className="flex items-center gap-3 justify-center w-full">
          <span className="text-[var(--text-primary)] text-sm">
            Pas encore de compte ?
          </span>
          <button
            type="button"
            className="text-[var(--primary)] font-semibold text-sm"
            onClick={() => {
              setMode(AuthType.REGISTER);
            }}
          >
            {"S'inscrire"}
          </button>
        </div>
      </div>
    </form>
  );
}
