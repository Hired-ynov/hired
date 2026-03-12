'use client';

import React, { useState, useEffect } from 'react';
import { Offer, Application, UserDTO } from '@repo/models';
import offerClient from '@/lib/offer/offerClient';
import applicationClient from '@/lib/application/applicationClient';
import profileClient from '@/lib/profile/profileClient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { offerSchema, OfferFormInput } from '@/lib/offer/offerShema';
import SkillsInput from '@/app/components/offer/SkillsInput';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface CompanyOffersManagerProps {
  companyId: string;
}

export default function CompanyOffersManager({
  companyId,
}: CompanyOffersManagerProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [applicationsMap, setApplicationsMap] = useState<
    Record<string, Application[]>
  >({});
  const [loadingApplications, setLoadingApplications] = useState<
    Record<string, boolean>
  >({});
  const [applicationsCounts, setApplicationsCounts] = useState<
    Record<string, number>
  >({});
  const [usersMap, setUsersMap] = useState<Record<string, UserDTO>>({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<OfferFormInput>({
    resolver: zodResolver(offerSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (companyId) {
      loadOffers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const loadOffers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await offerClient.getOffersByCompanyId(companyId);
      setOffers(data);

      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (offer) => {
          try {
            const apps = await applicationClient.getApplicationsByOfferId(
              offer.id,
            );
            counts[offer.id] = apps.length;
          } catch (err) {
            console.error(
              `Error loading applications count for offer ${offer.id}:`,
              err,
            );
            counts[offer.id] = 0;
          }
        }),
      );
      setApplicationsCounts(counts);
    } catch (err) {
      console.error('Error loading offers:', err);
      setError('Erreur lors du chargement des offres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return;
    }

    setDeletingId(offerId);
    try {
      await offerClient.deleteOffer(offerId);
      setOffers(offers.filter((offer) => offer.id !== offerId));
    } catch (err) {
      console.error('Error deleting offer:', err);
      setError("Erreur lors de la suppression de l'offre");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    reset({
      title: offer.title,
      description: offer.description,
      location: offer.location,
      salaryRange: offer.salaryRange || { min: 0, max: 0 },
      skills: offer.skills || [],
    });
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingOffer(null);
    reset();
    setError(null);
  };

  const onSubmitEdit = async (data: OfferFormInput) => {
    if (!editingOffer) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedOffer = await offerClient.updateOffer(editingOffer.id, data);
      setOffers(
        offers.map((o) => (o.id === editingOffer.id ? updatedOffer : o)),
      );
      setEditingOffer(null);
      reset();
    } catch (err) {
      console.error('Error updating offer:', err);
      setError("Erreur lors de la mise à jour de l'offre");
    } finally {
      setIsSaving(false);
    }
  };

  const formatSalary = (offer: Offer) => {
    if (!offer.salaryRange) return 'Non spécifié';
    const { min, max } = offer.salaryRange;
    if (min && max) {
      return `${min.toLocaleString('fr-FR')} € - ${max.toLocaleString('fr-FR')} €`;
    }
    if (min) return `À partir de ${min.toLocaleString('fr-FR')} €`;
    if (max) return `Jusqu'à ${max.toLocaleString('fr-FR')} €`;
    return 'Non spécifié';
  };

  const toggleApplications = async (offerId: string) => {
    if (expandedOfferId === offerId) {
      setExpandedOfferId(null);
      return;
    }

    setExpandedOfferId(offerId);

    if (!applicationsMap[offerId]) {
      setLoadingApplications({ ...loadingApplications, [offerId]: true });
      try {
        const apps = await applicationClient.getApplicationsByOfferId(offerId);
        setApplicationsMap({ ...applicationsMap, [offerId]: apps });

        const users: Record<string, UserDTO> = { ...usersMap };
        await Promise.all(
          apps.map(async (app) => {
            if (!users[app.userId]) {
              try {
                const user = await profileClient.getUserById(app.userId);
                users[app.userId] = user;
              } catch (err) {
                console.error(`Error loading user ${app.userId}:`, err);
              }
            }
          }),
        );
        setUsersMap(users);
      } catch (err) {
        console.error('Error loading applications:', err);
        toast.error('Erreur lors du chargement des candidatures');
      } finally {
        setLoadingApplications({ ...loadingApplications, [offerId]: false });
      }
    }
  };

  const handleStatusChange = async (
    applicationId: number | string,
    newStatus: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
    offerId: string,
  ) => {
    try {
      await applicationClient.updateApplicationStatus(applicationId, newStatus);

      setApplicationsMap((prev) => {
        const updatedApplications = prev[offerId].map((app) =>
          app.id === applicationId
            ? ({ ...app, status: newStatus } as Application)
            : app,
        );
        return {
          ...prev,
          [offerId]: updatedApplications,
        };
      });

      toast.success('Statut de la candidature mis à jour');
    } catch (err) {
      console.error('Error updating application status:', err);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <p>Chargement des offres...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="m-0 text-2xl font-bold text-gray-900">
            Mes offres d&apos;emploi
          </h3>
        </div>
        <Link
          href="/create-offer"
          className="px-5 py-2.5 bg-blue-600 text-white border-none rounded-lg cursor-pointer font-medium no-underline transition-all duration-200 hover:bg-blue-700 hover:shadow-md inline-flex items-center gap-2"
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
          Créer une offre
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-800 border border-red-200 rounded-lg flex items-start gap-3">
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

      {offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-center text-gray-500 font-medium">
            Aucune offre d&apos;emploi pour l&apos;instant
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300"
            >
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-5 py-4 border-b border-gray-200 flex justify-between items-start">
                <h4 className="m-0 text-lg font-bold text-gray-900 flex-1">
                  {offer.title}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(offer)}
                    className="p-2 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
                    title="Modifier l'offre"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600"
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
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-2 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-red-50 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={deletingId === offer.id}
                    title="Supprimer l'offre"
                  >
                    {deletingId === offer.id ? (
                      <svg
                        className="animate-spin w-4 h-4 text-gray-600"
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
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-5">
                <p className="text-gray-700 mb-5 leading-relaxed">
                  {offer.description}
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Localisation
                      </div>
                      <div className="text-gray-900 font-medium">
                        {offer.location || 'Non spécifié'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-green-600"
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
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Salaire
                      </div>
                      <div className="text-gray-900 font-medium">
                        {formatSalary(offer)}
                      </div>
                    </div>
                  </div>

                  {offer.skills && offer.skills.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                          Compétences requises
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {offer.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {offer.skills.length > 5 && (
                            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                              +{offer.skills.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <small className="text-sm">
                      Créée le{' '}
                      {new Date(offer.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </small>
                  </div>
                  <button
                    onClick={() => toggleApplications(offer.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium text-sm"
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {expandedOfferId === offer.id ? 'Masquer' : 'Voir'} les
                    candidatures
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-semibold">
                      {applicationsCounts[offer.id] ?? 0}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedOfferId === offer.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Section des candidatures */}
              {expandedOfferId === offer.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Candidatures reçues
                  </h4>

                  {loadingApplications[offer.id] ? (
                    <div className="flex items-center justify-center py-8">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-600"
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
                    </div>
                  ) : !applicationsMap[offer.id] ||
                    applicationsMap[offer.id].length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      Aucune candidature pour le moment
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {applicationsMap[offer.id].map((application) => {
                        const user = usersMap[application.userId];
                        return (
                          <div
                            key={application.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.firstName?.[0] || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {user?.firstName || 'Utilisateur'}{' '}
                                      {user?.lastName || ''}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {user?.email || 'Email non disponible'}
                                    </p>
                                  </div>
                                </div>
                                {application.firstMessage && (
                                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-700 italic line-clamp-3">
                                      &ldquo;{application.firstMessage}&rdquo;
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <select
                                  value={application.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      application.id,
                                      e.target.value as
                                        | 'pending'
                                        | 'accepted'
                                        | 'rejected'
                                        | 'withdrawn',
                                      offer.id,
                                    )
                                  }
                                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 cursor-pointer transition-all ${
                                    application.status === 'pending'
                                      ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                                      : application.status === 'accepted'
                                        ? 'bg-green-50 text-green-800 border-green-300'
                                        : application.status === 'rejected'
                                          ? 'bg-red-50 text-red-800 border-red-300'
                                          : 'bg-gray-50 text-gray-800 border-gray-300'
                                  }`}
                                >
                                  <option value="pending">⏳ En attente</option>
                                  <option value="accepted">✅ Acceptée</option>
                                  <option value="rejected">❌ Refusée</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                              <span>
                                📅 Candidature du{' '}
                                {new Date(
                                  application.createdAt,
                                ).toLocaleDateString('fr-FR')}
                              </span>
                              {user?.skills && user.skills.length > 0 && (
                                <div className="flex gap-1">
                                  {user.skills
                                    .slice(0, 3)
                                    .map((skill: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  {user.skills.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                      +{user.skills.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editingOffer && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200"
          onClick={handleCancelEdit}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h3 className="m-0 text-2xl font-bold text-gray-900">
                Modifier l&apos;offre
              </h3>
              <button
                onClick={handleCancelEdit}
                className="bg-white border border-gray-200 rounded-lg cursor-pointer text-gray-500 p-2 w-9 h-9 flex items-center justify-center transition-all duration-200 hover:text-gray-900 hover:bg-gray-50"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmitEdit)}
              className="p-6 flex flex-col gap-5"
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
                  htmlFor="title"
                  className="font-semibold text-gray-700 text-sm"
                >
                  Titre du poste *
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title')}
                  placeholder="Ex: Développeur Full Stack"
                  className={`p-3.5 border rounded-lg text-base bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
                />
                {errors.title && (
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
                    {errors.title.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="location"
                  className="font-semibold text-gray-700 text-sm"
                >
                  Localisation *
                </label>
                <input
                  id="location"
                  type="text"
                  {...register('location')}
                  placeholder="Ex: Paris, France"
                  className={`p-3.5 border rounded-lg text-base bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
                />
                {errors.location && (
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
                    {errors.location.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700 text-sm">
                  Fourchette de salaire
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      {...register('salaryRange.min', { valueAsNumber: true })}
                      placeholder="Minimum (€)"
                      className={`p-3.5 border rounded-lg text-base bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.salaryRange?.min ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
                    />
                    {errors.salaryRange?.min && (
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
                        {errors.salaryRange.min.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      {...register('salaryRange.max', { valueAsNumber: true })}
                      placeholder="Maximum (€)"
                      className={`p-3.5 border rounded-lg text-base bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.salaryRange?.max ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
                    />
                    {errors.salaryRange?.max && (
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
                        {errors.salaryRange.max.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="description"
                  className="font-semibold text-gray-700 text-sm"
                >
                  Description du poste *
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  placeholder="Décrivez le poste, les missions, l'environnement de travail..."
                  rows={6}
                  className={`p-3.5 border rounded-lg text-base bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y font-sans ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
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
                <label className="font-semibold text-gray-700 text-sm">
                  Compétences requises *
                </label>
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <SkillsInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.skills?.message}
                    />
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 border-none rounded-lg bg-blue-600 text-white font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
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
                      Enregistrement...
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
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
