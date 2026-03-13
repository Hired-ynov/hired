'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  applicationSchema,
  ApplicationInput,
} from '@/lib/application/applicationSchema';
import FormTextArea from '../form/FormTextArea';
import FormSubmitButton from '../form/FormSubmitButton';

type ApplicationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationInput) => Promise<void>;
  offerTitle: string;
};

export default function ApplicationModal({
  open,
  onClose,
  onSubmit,
  offerTitle,
}: ApplicationModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
  });

  const handleFormSubmit = async (data: ApplicationInput) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl p-8"
        style={{ backgroundColor: 'var(--white)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Postuler à l&apos;offre
          </h2>
          <button
            onClick={handleClose}
            className="text-2xl hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          <strong>{offerTitle}</strong>
        </p>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <label
              className="block mb-2 font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Lettre de motivation (optionnel)
            </label>
            <FormTextArea
              placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
              rows={8}
              error={errors.coverLetter?.message}
              {...register('coverLetter')}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-6 rounded-lg font-semibold border-2 transition-all duration-200 hover:bg-gray-50"
              style={{
                backgroundColor: 'var(--white)',
                borderColor: 'var(--background-tertiary)',
                color: 'var(--text-primary)',
              }}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <FormSubmitButton
              isSubmitting={isSubmitting}
              label={
                isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'
              }
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
