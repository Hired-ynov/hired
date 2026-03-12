import React from 'react';
import { OfferWithCompany } from '@/lib/offer/types';
import Link from 'next/link';

interface OfferCardProps {
  readonly offer: OfferWithCompany;
}

export default function OfferCard({ offer }: OfferCardProps) {
  const formattedDate = new Date(offer.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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

  return (
    <div
      className="w-full rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full"
      style={{
        backgroundColor: 'var(--white)',
        border: '1px solid var(--background-tertiary)',
      }}
    >
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <div>
          <h3
            className="text-xl font-bold mb-1 line-clamp-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {offer.title}
          </h3>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {offer.company?.name || 'Entreprise non spécifiée'}
          </p>
        </div>

        <p
          className="text-sm line-clamp-3 overflow-hidden"
          style={{ color: 'var(--text-secondary)' }}
        >
          {offer.description}
        </p>

        <div className="flex gap-3 flex-wrap">
          <InfoBadge icon={<LocationIcon />} text={offer.location} />
          <InfoBadge icon={<SalaryIcon />} text={salaryText} />
        </div>

        <div className="flex flex-wrap gap-2">
          {offer.skills.slice(0, 1).map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-1 rounded font-medium"
              style={{
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              {skill}
            </span>
          ))}
          {offer.skills.length > 1 && (
            <span
              className="text-xs px-2 py-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              +{offer.skills.length - 1}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">{formattedDate}</p>
      </div>

      <div
        className="mt-4 pt-4 border-t"
        style={{ borderColor: 'var(--background-tertiary)' }}
      >
        <Link
          href={`/offer/${offer.id}`}
          className="block w-full text-center font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--white)',
          }}
        >
          {`Voir l'offre`}
        </Link>
      </div>
    </div>
  );
}

const InfoBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
    style={{ backgroundColor: 'var(--background-tertiary)' }}
  >
    <div className="w-4 h-4">{icon}</div>
    <span style={{ color: 'var(--text-primary)' }}>{text}</span>
  </div>
);

const LocationIcon = () => (
  <svg
    className="w-full h-full"
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
    className="w-full h-full"
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
