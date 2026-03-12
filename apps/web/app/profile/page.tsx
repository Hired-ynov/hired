'use client';

import { Application, Offer } from '@repo/models';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Pen from '@/app/assets/Pen';
import ApplicationCard from '@/app/components/profile/ApplicationCard/ApplicationCard';
import CompanyManager from '@/app/components/profile/CompanyManager';
import SkillsManager from '@/app/components/profile/SkillsManager';
import applicationClient from '@/lib/application/applicationClient';
import { useAuth } from '@/lib/auth/authProvider';
import { getOfferById } from '@/lib/offer/offerClient';
import { sha256 } from '@/utils/hash';

type TabType = 'candidate' | 'employer';

export default function Profile() {
  const { isCheckingAuth, user: data } = useAuth();
  const router = useRouter();

  const [hash, setHash] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [offersMap, setOffersMap] = useState<Record<string, Offer>>({});
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('candidate');

  useEffect(() => {
    if (!isCheckingAuth && !data) {
      router.push('/');
    }
  }, [data, isCheckingAuth, router]);

  useEffect(() => {
    (async () => {
      if (data && data.email) {
        const emailHash = await sha256(data.email);
        setHash(emailHash);
      }
    })();
  }, [data]);

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoadingApplications(true);
        const apps = await applicationClient.getMyApplications();

        if (!Array.isArray(apps)) {
          console.error('Applications is not an array:', apps);
          setApplications([]);
          return;
        }

        setApplications(apps);

        const offers: Record<string, Offer> = {};
        await Promise.all(
          apps.map(async (app) => {
            try {
              const offer = await getOfferById(app.offerId);
              offers[app.offerId] = offer;
            } catch (error) {
              console.error(`Error fetching offer ${app.offerId}:`, error);
            }
          }),
        );
        setOffersMap(offers);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoadingApplications(false);
      }
    }

    if (data) {
      fetchApplications();
    }
  }, [data]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main
      className="flex flex-col items-center py-10"
      data-landmark-index="0"
      suppressHydrationWarning
    >
      <div className="flex flex-col gap-10 w-full max-w-5xl px-4">
        <header className="flex items-center gap-10">
          <Link
            aria-labelledby="update-picture-label"
            href="https://gravatar.com/profile"
            target="_blank"
            rel="noreferrer"
            className="relative border-2 border-blue-600 rounded-full overflow-hidden cursor-pointer group"
          >
            <Image
              src={
                hash
                  ? `https://gravatar.com/avatar/${hash}?s=150`
                  : 'https://placehold.co/150'
              }
              alt="placeholder"
              width={150}
              height={150}
              unoptimized
              className="w-[150px] h-[150px]"
            />

            <div className="absolute inset-0 flex flex-col justify-center items-center gap-2.5 bg-gray-600/60 backdrop-blur-sm text-white text-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
              <Pen />
              <p id="update-picture-label">Changer de photo de profil</p>
            </div>
          </Link>

          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-semibold text-blue-600">
                {data.firstName} {data.lastName}
              </h1>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                {data.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{data.email}</p>
          </div>

          <Link
            href="/profile/settings"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md"
            title="Paramètres du profil"
          >
            Paramètres
          </Link>
        </header>

        {/* Onglets de navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('candidate');
            }}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'candidate'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👤 Postulant
            {activeTab === 'candidate' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('employer');
            }}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'employer'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏢 Employeur
            {activeTab === 'employer' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Contenu du panel Postulant */}
        {activeTab === 'candidate' && (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-7">
              <h2 className="text-2xl font-semibold text-blue-600">
                💼 Mes compétences
              </h2>
              <SkillsManager initialSkills={data.skills || []} />
            </div>

            <hr className="w-4/5 mx-auto border-gray-300" />

            <div className="flex flex-col gap-7">
              <h2 className="text-2xl font-semibold text-blue-600">
                📝 Mes candidatures
              </h2>

              {loadingApplications ? (
                <p className="text-sm text-center text-gray-400">
                  Chargement des candidatures...
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {applications.length > 0 ? (
                    applications.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        offer={offersMap[application.offerId]}
                        onDelete={(id) => {
                          setApplications((apps) =>
                            apps.filter((app) => app.id !== id),
                          );
                        }}
                      />
                    ))
                  ) : (
                    <p className="w-full col-span-full text-sm text-center text-gray-400 select-none">
                      Vous n&apos;avez postulé à aucune offre pour
                      l&apos;instant
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenu du panel Employeur */}
        {activeTab === 'employer' && (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-7">
              <h2 className="text-2xl font-semibold text-blue-600">
                🏢 Mon entreprise
              </h2>
              <CompanyManager />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
