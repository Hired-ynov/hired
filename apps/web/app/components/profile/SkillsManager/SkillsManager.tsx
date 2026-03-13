'use client';

import React, { useState } from 'react';
import SkillsInput from '@/app/components/offer/SkillsInput';
import profileClient from '@/lib/profile/profileClient';
import { useAuth } from '@/lib/auth/authProvider';

interface SkillsManagerProps {
  initialSkills: string[];
}

export default function SkillsManager({
  initialSkills,
}: Readonly<SkillsManagerProps>) {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, user } = useAuth();

  const handleSave = async () => {
    if (skills.length === 0) {
      setError('Veuillez ajouter au moins une compétence');
      return;
    }

    if (!user?.id) {
      setError('Utilisateur non identifié');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedUser = await profileClient.updateSkills(user.id, skills);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde',
      );
      console.error('Error updating skills:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSkills(initialSkills);
    setIsEditing(false);
    setError(null);
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-5">
        <ul className="list-disc list-inside">
          {skills.length > 0 ? (
            skills.map((skill) => <li key={skill}>{skill}</li>)
          ) : (
            <p className="w-full text-sm text-center text-gray-400 select-none">
              Aucune compétence pour l&apos;instant
            </p>
          )}
        </ul>
        <button
          onClick={() => setIsEditing(true)}
          className="self-start px-5 py-2.5 border-none rounded-lg bg-blue-600 text-white text-[0.95rem] font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 active:scale-98"
          type="button"
        >
          {skills.length > 0
            ? 'Modifier les compétences'
            : 'Ajouter des compétences'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-5 rounded-lg bg-gray-50">
      <SkillsInput
        value={skills}
        onChange={setSkills}
        error={error || undefined}
        placeholder="Rechercher et ajouter des compétences..."
      />

      <div className="flex gap-4 justify-end mt-2.5">
        <button
          onClick={handleCancel}
          className="px-6 py-2.5 border-none rounded-lg bg-gray-200 text-gray-900 text-[0.95rem] font-medium cursor-pointer transition-all duration-200 hover:bg-gray-300 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
          type="button"
          disabled={isSaving}
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 border-none rounded-lg bg-blue-600 text-white text-[0.95rem] font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
          type="button"
          disabled={isSaving}
        >
          {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
