import React from 'react';

export default function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label
        className="block mb-2 font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
