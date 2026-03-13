'use client';

import React, { forwardRef, ReactNode } from 'react';

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string | undefined;
  className?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
};

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    { className = '', error, onRightIconClick, rightIcon, type, ...props },
    ref,
  ) => {
    const hasRightIcon = Boolean(rightIcon);
    const inputType = type;

    return (
      <>
        <div className="relative w-full">
          <input
            {...props}
            type={inputType}
            ref={ref}
            className={`w-full px-3 py-2 border rounded-md text-[var(--text-primary)] ${error ? 'border-[var(--error)]' : 'border-[var(--disabled-background)]'} ${hasRightIcon ? 'pr-10' : ''} ${className}`}
          />
          {hasRightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute inset-y-0 right-2 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error && <div className="text-[var(--error)] text-sm">{error}</div>}
      </>
    );
  },
);

FormInput.displayName = 'FormInput';

export default FormInput;
