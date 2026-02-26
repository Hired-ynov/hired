import { useAuth } from '@/lib/auth/authProvider';
import { useEffect, useState } from 'react';
import { Company } from '@repo/models';
import companyClient from './companyClient';

export function useCompany() {
  const { user, setUser } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId =
    user && 'companyId' in user
      ? ((user as unknown as Record<string, unknown>).companyId as string)
      : undefined;

  const loadCompany = async () => {
    // Ne charge que si on a un companyId
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await companyClient.getCompanyById(companyId);
      setCompany(data);
    } catch (err) {
      console.error('Error loading company:', err);
      setError(
        err instanceof Error ? err.message : 'Erreur lors du chargement',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCompany();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, companyId]);

  const createCompany = async (data: {
    name: string;
    description?: string;
    website?: string;
  }) => {
    try {
      const newCompany = await companyClient.createCompany(data);
      setCompany(newCompany);

      // Mettre à jour l'objet user avec le companyId
      if (user && newCompany.id) {
        setUser({
          ...user,
          companyId: newCompany.id,
        } as typeof user);
      }

      return newCompany;
    } catch (err) {
      console.error('Error creating company:', err);
      throw err;
    }
  };

  const updateCompany = async (
    data: Partial<{
      name: string;
      description?: string;
      website?: string;
    }>,
  ) => {
    if (!companyId) {
      throw new Error('Company ID is required to update');
    }

    try {
      const updatedCompany = await companyClient.updateCompany(companyId, data);
      setCompany(updatedCompany);
      return updatedCompany;
    } catch (err) {
      console.error('Error updating company:', err);
      throw err;
    }
  };

  return {
    company,
    isLoading,
    error,
    hasCompany: !!company,
    companyId,
    createCompany,
    updateCompany,
    refreshCompany: loadCompany,
  };
}
