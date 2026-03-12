'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Company } from '@repo/models';
import companyClient from '@/lib/company/companyClient';
import { companySchema, CompanyFormInput } from '@/lib/company/companySchema';
import { useAuth } from '@/lib/auth/authProvider';
import CompanyOffersManager from '@/app/components/profile/CompanyOffersManager';

export default function CompanyManager() {
  const { user, setUser } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormInput>({
    resolver: zodResolver(companySchema),
  });

  const loadCompany = async () => {
    setIsLoading(true);
    try {
      const companyId =
        user && 'companyId' in user
          ? (user as { companyId?: string }).companyId
          : undefined;
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      const data = await companyClient.getCompanyById(companyId);
      setCompany(data);
      if (data) {
        reset({
          name: data.name,
          description: data.description || '',
          website: data.website || '',
        });
      }
    } catch (err) {
      console.error('Error loading company:', err);
      setError("Erreur lors du chargement de l'entreprise");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCompany();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (data: CompanyFormInput) => {
    setIsSaving(true);
    setError(null);

    try {
      let updatedCompany: Company;

      if (company) {
        updatedCompany = await companyClient.updateCompany(company.id, data);
      } else {
        updatedCompany = await companyClient.createCompany(data);

        if (user && updatedCompany.id) {
          setUser({
            ...user,
            companyId: updatedCompany.id,
          } as typeof user);
        }
      }

      setCompany(updatedCompany);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde',
      );
      console.error('Error saving company:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (company) {
      reset({
        name: company.name,
        description: company.description || '',
        website: company.website || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        website: '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isEditing && !company) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Aucune entreprise enregistrée
          </p>
          <p className="text-sm text-gray-500">
            Créez votre profil entreprise pour commencer
          </p>
        </div>
        <button
          onClick={handleEdit}
          className="px-6 py-3 border-none rounded-lg bg-blue-600 text-white text-[0.95rem] font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          type="button"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Créer mon entreprise
        </button>
      </div>
    );
  }

  if (!isEditing && company) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {company.description && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  <strong className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                    Description
                  </strong>
                </div>
                <p className="text-gray-700 leading-relaxed pl-7">
                  {company.description}
                </p>
              </div>
            )}

            {company.website && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <strong className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                    Site web
                  </strong>
                </div>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 pl-7 truncate block max-w-full"
                  title={company.website}
                >
                  {company.website}
                </a>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleEdit}
              className="px-5 py-2.5 border-none rounded-lg bg-blue-600 text-white text-[0.95rem] font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              type="button"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Modifier l&apos;entreprise
            </button>
          </div>
        </div>

        <hr className="my-4 border-0 border-t border-gray-200" />

        <CompanyOffersManager companyId={company.id} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">
          {company ? "Modifier l'entreprise" : 'Créer votre entreprise'}
        </h3>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 flex flex-col gap-6"
      >
        {error && (
          <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="font-semibold text-gray-700 flex items-center gap-1"
          >
            Nom de l&apos;entreprise
            <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`p-3.5 border rounded-lg text-base bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
            placeholder="Acme Inc."
          />
          {errors.name && (
            <span className="text-red-600 text-sm flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="font-semibold text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            className={`p-3.5 border rounded-lg text-base bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 resize-y font-sans ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
            placeholder="Description de votre entreprise..."
            rows={4}
          />
          {errors.description && (
            <span className="text-red-600 text-sm flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="website" className="font-semibold text-gray-700">
            Site web
          </label>
          <input
            id="website"
            type="url"
            {...register('website')}
            className={`p-3.5 border rounded-lg text-base bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 ${errors.website ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
            placeholder="https://www.exemple.com"
          />
          {errors.website && (
            <span className="text-red-600 text-sm flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.website.message}
            </span>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-[0.95rem] font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            className="px-6 py-2.5 border-none rounded-lg bg-blue-600 text-white text-[0.95rem] font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sauvegarde...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {company ? 'Mettre à jour' : 'Créer'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
