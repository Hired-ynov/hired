'use client';

import React, { forwardRef } from 'react';

type FormTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string | undefined;
  className?: string;
};

const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <>
        <textarea
          {...props}
          ref={ref}
          className={`w-full px-3 py-2 border rounded-md text-[var(--text-primary)] ${error ? 'border-[var(--error)]' : 'border-[var(--disabled-background)]'} ${className}`}
          style={{
            resize: 'vertical',
            fontFamily: 'inherit',
            ...props.style,
          }}
        />
        {error && (
          <div className="text-[var(--error)] text-sm mt-1">{error}</div>
        )}
      </>
    );
  },
);

FormTextArea.displayName = 'FormTextArea';

export default FormTextArea;
