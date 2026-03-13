'use client';

import { InputHTMLAttributes, useState } from 'react';
import ClosedEye from '@/app/assets/ClosedEye';
import Eye from '@/app/assets/Eye';

export interface InputProps {
  label: string;
  /**
   * @default true
   */
  displayLabel?: boolean;
}

export default function Input({
  label,
  displayLabel = true,
  name,
  ...props
}: InputProps & InputHTMLAttributes<HTMLInputElement>) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1 group">
      {displayLabel && (
        <label htmlFor={name} className="ml-4 text-gray-950">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          name={name}
          {...props}
          type={
            props.type === 'password'
              ? isVisible
                ? 'text'
                : 'password'
              : props.type
          }
          aria-label={displayLabel ? label : undefined}
          className="px-4 py-2 w-full border border-gray-200 rounded-md bg-white shadow-sm outline-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />

        {props.type === 'password' && (
          <button
            type="button"
            className="z-20 absolute top-1/2 right-1 -translate-y-1/2 p-1 text-neutral-500 transition-colors hover:text-neutral-800"
            onClick={() => void setIsVisible((prev) => !prev)}
          >
            {isVisible ? (
              <ClosedEye className="w-5 aspect-auto" />
            ) : (
              <Eye className="w-5 aspect-auto" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
