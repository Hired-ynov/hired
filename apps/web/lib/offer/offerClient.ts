import { Offer } from '@repo/models';
import apiFetch from '../api';
import { OfferFormInput } from './offerShema';
import { OfferWithCompany } from './types';

export async function create(offer: OfferFormInput) {
  const res = await apiFetch('/offer', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(offer),
  });

  if (!res || res.ok === false) {
    throw new Error(res?.message ?? 'Offer creation failed');
  }
}

export async function getAllOffers() {
  const res = await apiFetch('/offer', {
    method: 'GET',
  });

  if (!res || res.ok === false) {
    throw new Error(res?.message ?? 'Failed to fetch offers');
  }

  const offers = (res.data || res).map((offer: OfferWithCompany) => ({
    ...offer,
    salaryRange:
      typeof offer.salaryRange === 'string'
        ? JSON.parse(offer.salaryRange)
        : offer.salaryRange,
  }));

  return offers as OfferWithCompany[];
}

export async function getOfferById(offerId: string) {
  const res = await apiFetch(`/offer/${offerId}`, {
    method: 'GET',
  });

  if (!res || res.ok === false) {
    throw new Error(res?.message ?? 'Failed to fetch offer');
  }

  const offer = res.data || res;

  return {
    ...offer,
    salaryRange:
      typeof offer.salaryRange === 'string'
        ? JSON.parse(offer.salaryRange)
        : offer.salaryRange,
  } as OfferWithCompany;
}

export async function getOffersByCompanyId(companyId: string) {
  const res = await apiFetch(`/offer/company/${companyId}`, {
    method: 'GET',
  });

  if (!res || res.ok === false) {
    throw new Error(res?.message ?? 'Failed to fetch company offers');
  }

  const offers = (res.data || res).map((offer: Offer) => ({
    ...offer,
    salaryRange:
      typeof offer.salaryRange === 'string'
        ? JSON.parse(offer.salaryRange)
        : offer.salaryRange,
  }));

  return offers as Offer[];
}

export async function deleteOffer(offerId: string) {
  const res = await apiFetch(`/offer/${offerId}`, {
    method: 'DELETE',
  });

  if (!res || res.ok === false) {
    throw new Error(res?.message ?? 'Failed to delete offer');
  }

  return res;
}

export async function updateOffer(
  offerId: string,
  data: Partial<OfferFormInput>,
) {
  const res = await apiFetch(`/offer/${offerId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res || res.ok === false) {
    throw new Error(res?.message ?? 'Failed to update offer');
  }

  return res as Offer;
}

const offerClient = {
  create,
  getAllOffers,
  getOfferById,
  getOffersByCompanyId,
  deleteOffer,
  updateOffer,
};

export default offerClient;
