import { Application } from '@repo/models';

import apiFetch from '../api';

export async function createApplication(
  offerId: string,
  coverLetter?: string,
): Promise<Application> {
  const res = await apiFetch('/application', {
    body: JSON.stringify({ firstMessage: coverLetter, offerId }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Application creation failed');
  }

  if (res.id) {
    return res as Application;
  }

  return res.data as Application;
}

export async function getMyApplications(): Promise<Application[]> {
  const res = await apiFetch('/application/me', {
    method: 'GET',
  });

  if (!res) {
    throw new Error('No response from server');
  }

  // Si la réponse est directement un tableau (cas où l'API retourne directement le JSON)
  if (Array.isArray(res)) {
    return res;
  }

  // Si la réponse contient ok: false
  if (res.ok === false) {
    throw new Error(res.message ?? 'Failed to fetch applications');
  }

  // Si les données sont dans res.data
  if (Array.isArray(res.data)) {
    return res.data;
  }

  // Sinon retourner un tableau vide
  console.warn('Unexpected response format:', res);
  return [];
}

export async function hasAppliedToOffer(offerId: string): Promise<boolean> {
  try {
    const applications = await getMyApplications();
    return applications.some((app) => app.offerId === offerId);
  } catch (error) {
    console.error('Error checking application status:', error);
    return false;
  }
}

export async function deleteApplication(
  applicationId: number | string,
): Promise<void> {
  const res = await apiFetch(`/application/${applicationId}`, {
    method: 'DELETE',
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to delete application');
  }
}

export async function getApplicationsByOfferId(
  offerId: string,
): Promise<Application[]> {
  const res = await apiFetch(`/application/offer/${offerId}`, {
    method: 'GET',
  });

  if (!res) {
    throw new Error('No response from server');
  }

  if (Array.isArray(res)) {
    return res;
  }

  if (res.ok === false) {
    throw new Error(res.message ?? 'Failed to fetch applications');
  }

  if (Array.isArray(res.data)) {
    return res.data;
  }

  console.warn('Unexpected response format:', res);
  return [];
}

export async function updateApplicationStatus(
  applicationId: number | string,
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
): Promise<Application> {
  const res = await apiFetch(`/application/${applicationId}`, {
    body: JSON.stringify({ status }),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to update application status');
  }

  return res.data as Application;
}

const applicationClient = {
  createApplication,
  deleteApplication,
  getApplicationsByOfferId,
  getMyApplications,
  hasAppliedToOffer,
  updateApplicationStatus,
};

export default applicationClient;
