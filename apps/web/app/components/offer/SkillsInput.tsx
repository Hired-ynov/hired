'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Skill } from '@repo/models';

type SkillsInputProps = {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  placeholder?: string;
};

export default function SkillsInput({
  value = [],
  onChange,
  error,
  placeholder = 'Rechercher une compétence...',
}: SkillsInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Skill && typeof Skill === 'object') {
      const skillsList = Object.values(Skill).filter(
        (skill) => typeof skill === 'string',
      ) as string[];
      setAllSkills(skillsList);
    }
  }, []);

  const filteredSkills = allSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !value.includes(skill),
  );

  const addSkill = (skill: string) => {
    if (!value.includes(skill)) {
      onChange([...value, skill]);
      setSearchTerm('');
      setShowDropdown(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md text-[var(--text-primary)] ${
            error
              ? 'border-[var(--error)]'
              : 'border-[var(--disabled-background)]'
          }`}
        />

        {showDropdown && filteredSkills.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border rounded-md shadow-lg"
            style={{
              backgroundColor: 'var(--white)',
              borderColor: 'var(--disabled-background)',
            }}
          >
            {filteredSkills.slice(0, 10).map((skill) => (
              <div
                key={skill}
                onClick={() => addSkill(skill)}
                className="px-3 py-2 cursor-pointer transition-colors duration-150 hover:bg-[var(--background-secondary)]"
                style={{ color: 'var(--text-primary)' }}
              >
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--background-tertiary)',
              }}
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-base font-bold leading-none hover:text-[var(--error)] transition-colors"
                aria-label={`Retirer ${skill}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <div className="text-[var(--error)] text-sm mt-1">{error}</div>}
    </div>
  );
}
