import apiFetch from '../api';
import { Company } from '@repo/models';

export async function createCompany(data: {
  name: string;
  description?: string;
  website?: string;
}) {
  const res = await apiFetch('/company', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res || res.ok === false) {
    throw new Error(res?.message ?? 'Company creation failed');
  }

  return res as Company;
}

export async function updateCompany(
  companyId: string,
  data: Partial<{
    name: string;
    description?: string;
    website?: string;
  }>,
) {
  const res = await apiFetch(`/company/${companyId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res || res.ok === false) {
    throw new Error(res?.message ?? 'Company update failed');
  }

  return res as Company;
}

export async function getCompanyById(companyId: string) {
  const res = await apiFetch(`/company/${companyId}`, {
    method: 'GET',
  });

  if (!res || res.ok === false) {
    if (res?.status === 404) {
      return null;
    }
    throw new Error(res?.message ?? 'Company fetch failed');
  }

  return res as Company;
}

export async function getAllCompanies() {
  const res = await apiFetch('/company', {
    method: 'GET',
  });

  if (!res || res.ok === false) {
    throw new Error(res?.message ?? 'Failed to fetch companies');
  }

  return res as Company[];
}

const companyClient = {
  createCompany,
  updateCompany,
  getCompanyById,
  getAllCompanies,
};

export default companyClient;
