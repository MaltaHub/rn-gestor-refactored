import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[var(--purple-dark)] text-[var(--white-pure)] hover:bg-[var(--purple-darker)] focus:ring-[var(--purple-light)] active:bg-[var(--purple-darker)] shadow-sm',
      secondary: 'bg-[var(--jungle-dark)] text-[var(--white-pure)] hover:bg-[var(--jungle-dark)]/90 focus:ring-[var(--jungle-light)] active:bg-[var(--jungle-dark)]/80 shadow-sm',
      outline: 'border-2 border-[var(--purple-dark)] text-[var(--purple-dark)] hover:bg-[var(--purple-pale)] focus:ring-[var(--purple-light)] dark:border-[var(--purple-light)] dark:text-[var(--purple-light)] dark:hover:bg-[var(--purple-dark)]/20',
      ghost: 'hover:bg-[var(--purple-pale)] text-[var(--purple-darker)] focus:ring-[var(--purple-light)] dark:text-[var(--purple-light)] dark:hover:bg-[var(--purple-dark)]/20',
      danger: 'bg-[var(--danger-dark)] text-[var(--white-pure)] hover:bg-[var(--danger)] focus:ring-[var(--danger-light)] active:bg-[var(--danger)] shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
