'use client';

import OfferForm from '../components/offer/OfferForm';
import { useCompany } from '@/lib/company/useCompany';
import { useAuth } from '@/lib/auth/authProvider';
import Link from 'next/link';

export default function CreateOfferPage() {
  const { company, isLoading } = useCompany();
  const { isCheckingAuth } = useAuth();

  if (isLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <main
          className="flex-1 py-10 px-6"
          style={{ backgroundColor: 'var(--background-secondary)' }}
        >
          <div className="max-w-[800px] mx-auto">
            <p>Chargement...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col">
        <main
          className="flex-1 py-10 px-6"
          style={{ backgroundColor: 'var(--background-secondary)' }}
        >
          <div className="max-w-[800px] mx-auto">
            <h1 className="mb-4">Entreprise requise</h1>
            <p className="mb-6">
              Vous devez créer une entreprise avant de pouvoir publier une offre
              d&apos;emploi.
            </p>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aller sur mon profil
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main
        className="flex-1 py-10 px-6"
        style={{ backgroundColor: 'var(--background-secondary)' }}
      >
        <div className="max-w-[800px] mx-auto">
          <h1 className="mb-4">{'Déposer une annonce'}</h1>
          <p className="mb-6">
            {
              "Remplissez le formulaire ci-dessous pour publier votre offre d'emploi"
            }
          </p>
          <OfferForm />
        </div>
      </main>
    </div>
  );
}
