'use client';

import { UserDTO } from '@repo/models';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FormEvent, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

import Arrow from '@/app/assets/Arrow';
import Close from '@/app/assets/Close';
import Input from '@/app/components/Input/Input';
import { useAuth } from '@/lib/auth/authProvider';
import profileClient from '@/lib/profile/profileClient';

export default function SettingsPage() {
  const { isCheckingAuth, setUser, user } = useAuth();

  const dialogRef = useRef<HTMLDialogElement>(null);

  const askAccountDeletion = useCallback(async () => {
    if (!user || !dialogRef.current) return;

    dialogRef.current.showModal();
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;

    try {
      await profileClient.deleteProfile(user.id);
      setUser(null);
      redirect('/');
    } catch (error) {
      console.error(error);
      toast.error(
        'Impossible de supprimer le compte. Veuillez réessayer plus tard.',
      );
    }
  }, [setUser, user]);

  const updateProfile = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      if (!user) return;

      const formData = new FormData(ev.currentTarget);
      const updatedUser: Partial<UserDTO> = {
        email: `${formData.get('email')}`.trim(),
        firstName: `${formData.get('firstName')}`.trim(),
        lastName: `${formData.get('lastName')}`.trim(),
      };

      const phoneNumber = `${formData.get('phoneNumber')}`.trim();
      if (/^([0-9]{10})$/.test(phoneNumber)) {
        // Get country code +33 for France
        const locale = Intl.NumberFormat().resolvedOptions().locale;
        const region = new Intl.Locale(locale).region;

        try {
          const phoneCodesResp = await fetch('/api/phones');
          const phoneCodes = await phoneCodesResp.json();
          const countryCode = (phoneCodes[region || 'FR'] || '33').replace(
            '+',
            '',
          );

          updatedUser.phoneNumber = `+${countryCode}${phoneNumber.slice(1)}`;
        } catch (error) {
          console.error(error);
          toast.error(
            'Impossible de récupérer le code pays pour le numéro de téléphone.',
          );
        }
      } else if (/^(\+[0-9]+)$/.test(phoneNumber)) {
        updatedUser.phoneNumber = phoneNumber;
      }

      if (`${formData.get('location')}`.trim().length > 0) {
        updatedUser.location = `${formData.get('location')}`;
      }

      try {
        const res = await profileClient.updateProfile(user.id, updatedUser);
        setUser(res);
        toast.success('Profil mis à jour avec succès !');
      } catch (error) {
        console.error(error);
        toast.error(
          'Impossible de mettre à jour le profil. Veuillez réessayer plus tard.',
        );
      }
    },
    [user, setUser],
  );

  const updatePassword = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      if (!user) return;

      const form = ev.currentTarget;
      const formData = new FormData(form);

      const currentPassword = `${formData.get('currentPassword')}`.trim();
      const newPassword = `${formData.get('newPassword')}`.trim();
      const confirmNewPassword = `${formData.get('confirmNewPassword')}`.trim();

      if (newPassword !== confirmNewPassword) {
        toast.error('Les nouveaux mots de passe ne correspondent pas.');
        return;
      }

      try {
        await profileClient.updatePassword(
          user.id,
          currentPassword,
          newPassword,
        );
        form.reset();
        toast.success('Mot de passe mis à jour avec succès !');
      } catch (error) {
        console.error(error);

        if ((error as Error).message === 'Current password is incorrect') {
          toast.error('Le mot de passe actuel est incorrect.');
          return;
        }

        toast.error(
          'Impossible de mettre à jour le mot de passe. Veuillez réessayer plus tard.',
        );
      }
    },
    [user],
  );

  if (!user && !isCheckingAuth) {
    redirect('/');
  }

  if (isCheckingAuth || !user)
    return (
      <p className="text-neutral-950 mx-auto mt-10 w-max">Chargement...</p>
    );

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 mx-auto py-10 px-4 md:px-6 lg:px-10 max-w-7xl">
        <header className="flex flex-col items-start gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-1 px-4 py-2 rounded-md text-primary transition-colors hover:bg-primary/10"
          >
            <Arrow className="w-4 aspect-auto" />
            Retour
          </Link>

          <h1 className="text-primary!">Édition du profil</h1>
        </header>

        <form
          onSubmit={updateProfile}
          className="flex flex-col gap-6 px-6 py-4 rounded-2xl bg-white shadow-md"
        >
          <h2 className="text-neutral-800!">Informations générales</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="firstName"
              label="Prénom"
              displayLabel={false}
              placeholder="Prénom"
              type="text"
              defaultValue={user.firstName}
              required
              autoComplete="given-name"
            />
            <Input
              name="lastName"
              label="Nom"
              displayLabel={false}
              placeholder="Nom"
              type="text"
              defaultValue={user.lastName}
              required
              autoComplete="family-name"
            />
          </div>

          <Input
            name="email"
            label="Adresse e-mail"
            displayLabel={false}
            placeholder="Adresse e-mail"
            type="email"
            defaultValue={user.email}
            required
            autoComplete="email"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="phoneNumber"
              label="Téléphone"
              displayLabel={false}
              placeholder="Téléphone"
              type="text"
              defaultValue={user.phoneNumber}
              autoComplete="tel"
            />
            <Input
              name="location"
              label="Lieu"
              displayLabel={false}
              placeholder="Lieu"
              type="text"
              defaultValue={user.location}
              autoComplete="address-level2"
            />
          </div>

          <div className="flex justify-end items-center gap-2">
            <button
              type="reset"
              className="px-6 py-2 rounded-md text-red-500 transition-colors hover:bg-red-100"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-md   bg-primary  transition-colors hover:text-primary hover:bg-primary/20"
            >
              Modifier
            </button>
          </div>
        </form>

        <form
          onSubmit={updatePassword}
          className="flex flex-col gap-4 px-6 py-4 rounded-2xl bg-white shadow-md"
        >
          <h2 className="text-neutral-800!">Mot de passe</h2>

          <Input
            name="currentPassword"
            label="Mot de passe actuel"
            displayLabel={false}
            placeholder="Mot de passe actuel"
            type="password"
            required
            autoComplete="current-password"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="newPassword"
              label="Nouveau mot de passe"
              displayLabel={false}
              placeholder="Nouveau mot de passe"
              type="password"
              required
              autoComplete="new-password"
            />

            <Input
              name="confirmNewPassword"
              label="Nouveau mot de passe"
              displayLabel={false}
              placeholder="Nouveau mot de passe"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="flex justify-end items-center gap-2">
            <button
              type="reset"
              className="px-6 py-2 rounded-md text-red-500 transition-colors hover:bg-red-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2  rounded-md bg-primary  transition-colors hover:text-primary hover:bg-primary/20"
            >
              Modifier
            </button>
          </div>
        </form>

        <div className="flex justify-end mt-6 px-6 py-4 rounded-2xl">
          <button
            type="button"
            className="px-6 py-2 rounded-md bg-red-600 text-white transition-colors hover:bg-red-700"
            onClick={askAccountDeletion}
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="m-auto min-w-lg rounded-2xl bg-white shadow-lg"
      >
        <header className="flex justify-between items-center px-4 py-3 bg-gray-100">
          <p>Supprimer le compte</p>

          <button
            type="button"
            aria-label="Fermer la boite de dialogue"
            className="p-2 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => dialogRef.current?.close()}
          >
            <Close className="w-5 aspect-auto" />
          </button>
        </header>

        <div className="flex flex-col gap-10 px-6 py-4">
          <p>
            Êtes-vous sûr de vouloir supprimer votre compte ?<br />
            Cette action est irréversible.
          </p>

          <div className="flex gap-6 justify-end items-center">
            <button
              type="button"
              className="px-6 py-2 rounded-md text-red-500 transition-colors hover:bg-red-100"
              onClick={() => dialogRef.current?.close()}
            >
              Annuler
            </button>

            <button
              type="button"
              className="px-6 py-2 rounded-md bg-red-600 text-white transition-colors hover:bg-red-700"
              onClick={deleteAccount}
            >
              Supprimer
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
