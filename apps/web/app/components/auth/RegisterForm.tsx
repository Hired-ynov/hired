'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterDTO } from '@repo/models';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import authClient from '../../../lib/auth/authClient';
import { useAuth } from '../../../lib/auth/authProvider';
import {
  type RegisterInput,
  registerSchema,
} from '../../../lib/auth/authSchema';
import { AuthType } from '../../../lib/auth/types';
import { handleAuthError } from '../../../lib/auth/utils';
import ClosedEye from '../../assets/ClosedEye';
import Eye from '../../assets/Eye';
import FormInput from '../form/FormInput';
import FormSubmitButton from '../form/FormSubmitButton';

interface RegisterFormProps {
  onClose: () => void;
  setMode: (mode: AuthType) => void;
}

export default function RegisterForm({ onClose, setMode }: RegisterFormProps) {
  const { setUser } = useAuth();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<RegisterInput>({
    mode: 'onBlur',
    resolver: zodResolver(registerSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(values: RegisterInput) {
    const RegisterDTO: RegisterDTO = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
    };

    if (values.phoneNumber) {
      const phoneNumber = values.phoneNumber.trim();
      if (/^([0-9]{10})$/.test(phoneNumber)) {
        const locale = Intl.NumberFormat().resolvedOptions().locale;
        const region = new Intl.Locale(locale).region;

        try {
          const phoneCodesResp = await fetch('/api/phones');
          const phoneCodes = await phoneCodesResp.json();
          const countryCode = (phoneCodes[region || 'FR'] || '33').replace(
            '+',
            '',
          );

          RegisterDTO.phoneNumber = `+${countryCode}${phoneNumber.slice(1)}`;
        } catch (error) {
          console.error(error);
          toast.error(
            'Impossible de récupérer le code pays pour le numéro de téléphone.',
          );
        }
      } else if (/^(\+[0-9]+)$/.test(phoneNumber)) {
        RegisterDTO.phoneNumber = phoneNumber;
      }
    }

    try {
      await authClient.register(RegisterDTO);
      const user = await authClient.me();
      if (!user) {
        throw new Error('Failed to fetch user profile');
      }
      setUser(user);
      onClose();
      reset();
    } catch (error: unknown) {
      handleAuthError(error, AuthType.REGISTER);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        placeholder="Prénom *"
        {...register('firstName')}
        error={errors.firstName?.message}
      />
      <FormInput
        placeholder="Nom *"
        {...register('lastName')}
        error={errors.lastName?.message}
      />
      <FormInput
        placeholder="Email *"
        {...register('email')}
        error={errors.email?.message}
      />
      <FormInput
        placeholder="Mot de passe *"
        {...register('password')}
        type={showPassword ? 'text' : 'password'}
        error={errors.password?.message}
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
      <FormInput
        placeholder="Confirmer le mot de passe *"
        {...register('confirmPassword')}
        type={showConfirmPassword ? 'text' : 'password'}
        error={errors.confirmPassword?.message}
        rightIcon={
          showConfirmPassword ? (
            <ClosedEye className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )
        }
        onRightIconClick={() => {
          setShowConfirmPassword((prev) => !prev);
        }}
      />
      <FormInput
        placeholder="Téléphone"
        {...register('phoneNumber')}
        type="tel"
        error={errors.phoneNumber?.message}
      />

      <div className="flex flex-col items-center gap-3">
        <FormSubmitButton isSubmitting={isSubmitting} label="S'inscrire" />
        <div className="flex items-center gap-3 justify-center w-full">
          <span className="text-sm">Déjà un compte ?</span>
          <button
            type="button"
            className="text-[var(--primary)] font-semibold text-sm"
            onClick={() => {
              setMode(AuthType.LOGIN);
            }}
          >
            Se connecter
          </button>
        </div>
      </div>
    </form>
  );
}
