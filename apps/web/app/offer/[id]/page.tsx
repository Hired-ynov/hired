'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OfferWithCompany } from '@/lib/offer/types';
import { getOfferById } from '@/lib/offer/offerClient';
import {
  createApplication,
  hasAppliedToOffer,
} from '@/lib/application/applicationClient';
import { ApplicationInput } from '@/lib/application/applicationSchema';
import ApplicationModal from '@/app/components/application/ApplicationModal';
import { toast } from 'react-toastify';
import { useAuth } from '@/lib/auth/authProvider';
import { useChat } from '@/app/components/chat/ChatProvider';

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { openChatForOffer } = useChat();
  const [offer, setOffer] = useState<OfferWithCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    async function fetchOffer() {
      try {
        setLoading(true);
        const data = await getOfferById(params.id as string);
        setOffer(data);

        // Vérifier si l'utilisateur a déjà postulé (uniquement si connecté)
        if (user) {
          const applied = await hasAppliedToOffer(params.id as string);
          setHasApplied(applied);
        } else {
          setHasApplied(false);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement de l'offre",
        );
        console.error('Error fetching offer:', err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchOffer();
    }
  }, [params.id, user]);

  const handleApplyClick = () => {
    if (!user) {
      toast.warning('Vous devez être connecté pour postuler');
      return;
    }
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSubmit = async (data: ApplicationInput) => {
    if (!offer) return;

    try {
      setIsApplying(true);
      await createApplication(offer.id, data.coverLetter);
      setHasApplied(true);
      toast.success('Candidature envoyée avec succès !');
    } catch (err) {
      console.error('Error submitting application:', err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'envoi de la candidature",
      );
      throw err;
    } finally {
      setIsApplying(false);
    }
  };

  const handleContactCompany = () => {
    if (!user) {
      toast.warning("Vous devez être connecté pour contacter l'entreprise");
      return;
    }
    if (offer) {
      openChatForOffer(offer.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p
          style={{ color: 'var(--text-secondary)' }}
        >{`Chargement de l'offre...`}</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--error)' }}>{error || 'Offre non trouvée'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 rounded-lg font-semibold"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--white)' }}
        >
          Retour aux offres
        </button>
      </div>
    );
  }

  const formatSalary = (amount: number) =>
    amount?.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }) || '0 €';

  const salaryText =
    offer.salaryRange?.min && offer.salaryRange?.max
      ? `${formatSalary(offer.salaryRange.min)} - ${formatSalary(offer.salaryRange.max)}`
      : 'Non spécifié';

  const formattedDate = new Date(offer.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex-1 py-10 px-6">
      <div className="max-w-4xl h-full mx-auto flex flex-col">
        <div
          className="flex-1 rounded-2xl p-8 shadow-lg flex flex-col"
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--background-tertiary)',
          }}
        >
          <div>
            <p
              className="text-sm mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Publiée le {formattedDate}
            </p>
            <h1
              className="text-3xl font-bold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              {offer.title}
            </h1>
            <p
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {offer.company?.name || 'Entreprise non spécifiée'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 my-8">
            <InfoCard
              icon={<LocationIcon />}
              label="Localisation"
              value={offer.location}
            />
            <InfoCard
              icon={<SalaryIcon />}
              label="Rémunération"
              value={salaryText}
            />
          </div>

          <section className="mb-8">
            <h2 className="mb-4">Description du poste</h2>
            <p
              className="leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              {offer.description}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4">Compétences requises</h2>
            <div className="flex flex-wrap gap-3">
              {offer.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: 'var(--white)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--background-tertiary)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <div className="flex-1"></div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="py-3 px-6 rounded-lg font-semibold border-2 transition-all duration-200 hover:bg-gray-50"
              style={{
                backgroundColor: 'var(--white)',
                borderColor: 'var(--background-tertiary)',
                color: 'var(--text-primary)',
              }}
            >
              Retour
            </button>
            <button
              onClick={handleContactCompany}
              className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--white)',
                borderColor: 'var(--primary)',
                border: '2px solid',
                color: 'var(--primary)',
              }}
            >
              💬 Contacter l&apos;entreprise
            </button>
            <button
              onClick={handleApplyClick}
              disabled={hasApplied || isApplying}
              className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
              style={{
                backgroundColor: hasApplied
                  ? 'var(--success)'
                  : 'var(--primary)',
                color: 'var(--white)',
              }}
            >
              {hasApplied ? 'Candidature envoyée ✓' : 'Postuler'}
            </button>
          </div>
        </div>
      </div>

      <ApplicationModal
        open={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        onSubmit={handleApplicationSubmit}
        offerTitle={offer.title}
      />
    </div>
  );
}

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-lg flex-1 min-w-[200px]"
    style={{ backgroundColor: 'var(--background-secondary)' }}
  >
    <div
      className="w-10 h-10 flex items-center justify-center rounded-lg"
      style={{ backgroundColor: 'var(--background-tertiary)' }}
    >
      {icon}
    </div>
    <div>
      <p
        className="text-xs font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </p>
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  </div>
);

const LocationIcon = () => (
  <svg
    className="w-5 h-5"
    style={{ color: 'var(--primary)' }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const SalaryIcon = () => (
  <svg
    className="w-5 h-5"
    style={{ color: 'var(--success)' }}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
