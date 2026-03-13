'use client';

import React from 'react';

type FormSubmitButtonProps = {
  isSubmitting?: boolean;
  label: string;
  className?: string;
};

export default function FormSubmitButton({
  isSubmitting = false,
  label,
  className = '',
}: FormSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={`bg-[var(--primary)] text-white px-5 py-3 rounded-lg text-base min-w-[220px] disabled:opacity-60 ${className}`}
      disabled={isSubmitting}
    >
      {label}
    </button>
  );
}
