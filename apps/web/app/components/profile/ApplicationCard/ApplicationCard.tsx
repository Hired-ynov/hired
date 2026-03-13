import React, { useState } from 'react';
import { Application, Offer } from '@repo/models';
import Link from 'next/link';
import applicationClient from '@/lib/application/applicationClient';
import { toast } from 'react-toastify';

interface ApplicationCardProps {
  readonly application: Application;
  readonly offer?: Offer;
  readonly onDelete?: (applicationId: number | string) => void;
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  withdrawn: 'Retirée',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

export default function ApplicationCard({
  application,
  offer,
  onDelete,
}: ApplicationCardProps) {
  const statusLabel = statusLabels[application.status] || application.status;
  const statusColor =
    statusColors[application.status] || 'bg-gray-100 text-gray-800';
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmMessage = offer
      ? `Êtes-vous sûr de vouloir retirer votre candidature pour "${offer.title}" ?`
      : 'Êtes-vous sûr de vouloir retirer cette candidature ?';

    if (!globalThis.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsDeleting(true);
      await applicationClient.deleteApplication(application.id);
      toast.success('Candidature retirée avec succès');
      if (onDelete) {
        onDelete(application.id);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Erreur lors de la suppression de la candidature');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="flex justify-between items-start gap-3 p-5 pb-3 bg-gradient-to-r from-blue-50 to-transparent">
        <Link
          href={`/offer/${application.offerId}`}
          className="text-xl font-semibold text-blue-600 hover:text-blue-700 hover:underline line-clamp-2 flex-1"
        >
          {offer?.title || 'Chargement...'}
        </Link>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pt-3">
        {offer && (
          <>
            <div className="flex justify-between items-center text-sm mb-3">
              <p className="font-medium text-gray-700">📍 {offer.location}</p>
              <p className="text-green-600 font-semibold">
                {offer.salaryRange.min.toLocaleString()} -{' '}
                {offer.salaryRange.max.toLocaleString()}€
              </p>
            </div>

            <hr className="border-gray-200 my-3" />

            <div className="mb-3">
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {offer.description}
              </p>
            </div>

            {application.firstMessage && (
              <>
                <hr className="border-gray-200 my-3" />
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    💬 Votre message :
                  </p>
                  <p className="text-sm text-gray-600 italic leading-relaxed line-clamp-3 bg-gray-50 p-2 rounded-lg">
                    {application.firstMessage}
                  </p>
                </div>
              </>
            )}

            <hr className="border-gray-200 my-3" />

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                🔧 Compétences requises :
              </p>
              <div className="flex flex-wrap gap-1.5">
                {offer.skills.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
                {offer.skills.length > 5 && (
                  <span className="px-2 py-1 text-gray-500 text-xs">
                    +{offer.skills.length - 5} autres
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {!offer && (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-400">
              Chargement des détails de l&apos;offre...
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            📅 Postulé le{' '}
            {new Date(application.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? '⏳ Suppression...' : '🗑️ Retirer ma candidature'}
        </button>
      </div>
    </div>
  );
}
