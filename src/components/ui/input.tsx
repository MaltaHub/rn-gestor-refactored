import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={errorId}
            className={`
              w-full px-4 py-2.5 rounded-lg border transition-all duration-200
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error 
                ? 'border-[var(--danger)] focus:ring-[var(--danger)] focus:border-[var(--danger)]' 
                : 'border-[var(--gray-light)] dark:border-[var(--purple-dark)]/30 focus:ring-[var(--purple-magic)] focus:border-[var(--purple-magic)]'
              }
              bg-[var(--white-pure)] dark:bg-[var(--surface-dark)] 
              text-[var(--foreground)]
              placeholder:text-[var(--foreground)]/40
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-[var(--danger)] dark:text-[var(--danger-light)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
