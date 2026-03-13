'use client';

import { Skill } from '@repo/models';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import AuthModal from './components/auth/AuthModal';
import OfferCard from './components/offer/OfferCard';

import { useAuth } from '@/lib/auth/authProvider';
import { AuthType } from '@/lib/auth/types';
import { getAllOffers } from '@/lib/offer/offerClient';
import { OfferWithCompany } from '@/lib/offer/types';
import { useSearch } from '@/lib/search/SearchContext';

export default function Home() {
  const [offers, setOffers] = useState<OfferWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { searchValue } = useSearch();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [salaryMin, setSalaryMin] = useState<number>(0);

  useEffect(() => {
    async function fetchOffers() {
      try {
        setLoading(true);
        const data = await getAllOffers();
        setOffers(Array.isArray(data) ? data : []);
      } catch (error_) {
        setError(
          error_ instanceof Error
            ? error_.message
            : 'Erreur lors du chargement des offres',
        );
        console.error('Error fetching offers:', error_);
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, []);

  const filteredOffers = offers.filter((offer) => {
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      if (!offer.title.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (selectedSkills.length > 0) {
      const hasMatchingSkill = selectedSkills.some((skill) =>
        offer.skills.includes(skill),
      );
      if (!hasMatchingSkill) return false;
    }

    if (selectedLocation && offer.location !== selectedLocation) {
      return false;
    }

    if (
      salaryMin > 0 &&
      offer.salaryRange &&
      offer.salaryRange.min < salaryMin
    ) {
      return false;
    }

    return true;
  });

  const allSkills = [
    ...new Set(offers.flatMap((offer) => offer.skills)),
  ].sort();

  const allLocations = [
    ...new Set(offers.map((offer) => offer.location).filter(Boolean)),
  ].sort();

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const resetFilters = () => {
    setSelectedSkills([]);
    setSelectedLocation('');
    setSalaryMin(0);
  };

  return (
    <div className="font-sans pb-12">
      {/* Hero Section */}
      <section
        className="mb-16 text-center p-12 rounded-3xl"
        style={{
          background: `linear-gradient(135deg, var(--background-secondary) 0%, var(--background-tertiary) 100%)`,
          boxShadow: '0 10px 30px rgba(109, 90, 234, 0.1)',
        }}
      >
        <h1 className="text-5xl font-bold mb-6">
          Bienvenue chez <span style={{ color: 'var(--primary)' }}>Hired</span>
        </h1>
        <p
          className="text-xl mb-8 max-w-3xl mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          La plateforme qui connecte les talents avec les meilleures
          opportunités professionnelles
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="#offers"
            className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
          >
            Voir les offres
          </Link>
          {user ? (
            <Link
              href="/profile"
              className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                background: 'var(--background-tertiary)',
                color: 'var(--text-primary)',
              }}
            >
              Mon profil
            </Link>
          ) : (
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
              }}
              className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                background: 'var(--background-tertiary)',
                color: 'var(--text-primary)',
              }}
            >
              Créer un profil
            </button>
          )}
        </div>
      </section>

      {/* Offers Section */}
      <section id="offers" className="px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Dernières offres d&apos;emploi
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Découvrez nos dernières opportunités de carrière
          </p>
        </div>

        {/* Bouton Filtrer */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => {
              setShowFilters(!showFilters);
            }}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{
              background: showFilters
                ? 'var(--primary)'
                : 'var(--background-tertiary)',
              color: showFilters ? 'white' : 'var(--text-primary)',
            }}
          >
            {showFilters ? '✕ Masquer les filtres' : '🔍 Filtrer les offres'}
            {(selectedSkills.length > 0 ||
              selectedLocation ||
              salaryMin > 0) && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: showFilters ? 'white' : 'var(--primary)',
                  color: showFilters ? 'var(--primary)' : 'white',
                }}
              >
                {selectedSkills.length +
                  (selectedLocation ? 1 : 0) +
                  (salaryMin > 0 ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div
            className="mb-8 p-6 rounded-2xl"
            style={{
              background: 'var(--background-secondary)',
              border: '1px solid var(--background-tertiary)',
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filtres</h3>
              <button
                onClick={resetFilters}
                className="text-sm px-4 py-2 rounded-lg transition-all hover:scale-105"
                style={{
                  background: 'var(--background-tertiary)',
                  color: 'var(--text-primary)',
                }}
              >
                Réinitialiser
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Filtre Compétences */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Compétences
                </label>
                <div
                  className="max-h-48 overflow-y-auto space-y-2 p-2 rounded-lg"
                  style={{ background: 'var(--background-primary)' }}
                >
                  {allSkills.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 cursor-pointer hover:bg-[var(--background-secondary)] p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => {
                          toggleSkill(skill);
                        }}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {skill}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtre Localisation */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Localisation
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                  }}
                  className="w-full p-3 rounded-lg border-2 outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--background-primary)',
                    borderColor: 'var(--background-tertiary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">Toutes les localisations</option>
                  {allLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre Salaire */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Salaire minimum (€/an)
                </label>
                <div className="space-y-3">
                  <div>
                    <label
                      className="text-xs mb-1 block"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {salaryMin.toLocaleString('fr-FR')} €{' '}
                      {salaryMin === 0 ? '(tous les salaires)' : 'et plus'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200000"
                      step="5000"
                      value={salaryMin}
                      onChange={(e) => {
                        setSalaryMin(Number(e.target.value));
                      }}
                      className="w-full"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Compteur de résultats */}
            <div
              className="mt-4 text-sm text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              {filteredOffers.length} offre
              {filteredOffers.length > 1 ? 's' : ''} trouvée
              {filteredOffers.length > 1 ? 's' : ''}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && (
            <div className="col-span-full text-center py-12">
              <p style={{ color: 'var(--text-secondary)' }}>
                Chargement des offres...
              </p>
            </div>
          )}

          {error && (
            <div className="col-span-full text-center py-12">
              <p style={{ color: 'var(--error)' }}>{error}</p>
            </div>
          )}

          {!loading && !error && filteredOffers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p style={{ color: 'var(--text-secondary)' }}>
                {searchValue
                  ? 'Aucune offre ne correspond à votre recherche'
                  : 'Aucune offre disponible pour le moment'}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredOffers
              .slice(0, 6)
              .map((offer) => <OfferCard key={offer.id} offer={offer} />)}
        </div>

        {!loading && !error && filteredOffers.length > 6 && (
          <div className="text-center mt-8">
            <Link
              href="/offer"
              className="inline-block px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                background: 'var(--background-tertiary)',
                color: 'var(--text-primary)',
              }}
            >
              Voir toutes les offres
            </Link>
          </div>
        )}
      </section>

      <AuthModal
        open={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
        }}
        initialMode={AuthType.LOGIN}
      />
    </div>
  );
}
