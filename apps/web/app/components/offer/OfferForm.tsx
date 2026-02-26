'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '../form/FormInput';
import FormTextArea from '../form/FormTextArea';
import FormField from '../form/FormField';
import FormSubmitButton from '../form/FormSubmitButton';
import { OfferFormInput, offerSchema } from '@/lib/offer/offerShema';
import SkillsInput from './SkillsInput';
import offerClient from '@/lib/offer/offerClient';
import Link from 'next/link';

export default function OfferForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OfferFormInput>({
    resolver: zodResolver(offerSchema),
    mode: 'onBlur',
    defaultValues: {
      skills: [],
      salaryRange: {
        min: 0,
        max: 0,
      },
    },
  });

  async function onSubmit(offer: OfferFormInput) {
    try {
      await offerClient.create(offer);
      reset();
      globalThis.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert("Erreur lors de la publication de l'annonce");
    } finally {
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-8 rounded-2xl shadow-sm bg-white"
    >
      <FormField label="Titre du poste">
        <FormInput
          {...register('title')}
          type="text"
          placeholder="Ex: Développeur Full Stack"
          error={errors.title?.message}
        />
      </FormField>

      <FormField label="Localisation">
        <FormInput
          {...register('location')}
          type="text"
          placeholder="Ex: Paris, France"
          error={errors.location?.message}
        />
      </FormField>

      <FormField label="Fourchette de salaire">
        <div className="flex gap-4">
          <div className="flex-1">
            <FormInput
              {...register('salaryRange.min', { valueAsNumber: true })}
              type="number"
              placeholder="Salaire minimum (€)"
              error={errors.salaryRange?.min?.message}
            />
          </div>
          <div className="flex-1">
            <FormInput
              {...register('salaryRange.max', { valueAsNumber: true })}
              type="number"
              placeholder="Salaire maximum (€)"
              error={errors.salaryRange?.max?.message}
            />
          </div>
        </div>
      </FormField>

      <FormField label="Description du poste">
        <FormTextArea
          {...register('description')}
          placeholder="Décrivez le poste, les missions, l'environnement de travail..."
          rows={6}
          error={errors.description?.message}
        />
      </FormField>

      <FormField label="Compétences requises">
        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <SkillsInput
              value={field.value}
              onChange={field.onChange}
              error={errors.skills?.message}
              placeholder="Rechercher et sélectionner des compétences..."
            />
          )}
        />
      </FormField>

      <div className="flex gap-4 justify-end">
        <Link
          href="/"
          className="py-3 px-6 border-2 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-[var(--background-secondary)]"
          style={{
            borderColor: 'var(--background-tertiary)',
            backgroundColor: 'var(--white)',
            color: 'var(--text-primary)',
          }}
        >
          Annuler
        </Link>
        <FormSubmitButton
          isSubmitting={isSubmitting}
          label="Publier l'annonce"
        />
      </div>
    </form>
  );
}
