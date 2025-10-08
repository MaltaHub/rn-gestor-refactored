import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full';
    
    const variants = {
      default: 'bg-[var(--gray-whisper)] text-[var(--foreground)] dark:bg-[var(--purple-dark)]/20 dark:text-[var(--foreground)]',
      success: 'bg-[var(--jungle-pale)] text-[var(--jungle-dark)] dark:bg-[var(--jungle-dark)] dark:text-[var(--jungle-pale)]',
      warning: 'bg-[var(--warning-pale)] text-[var(--warning)] dark:bg-[var(--warning)]/30 dark:text-[var(--warning-light)]',
      danger: 'bg-[var(--danger-pale)] text-[var(--danger)] dark:bg-[var(--danger)]/30 dark:text-[var(--danger-light)]',
      info: 'bg-[var(--purple-pale)] text-[var(--purple-dark)] dark:bg-[var(--purple-dark)] dark:text-[var(--purple-pale)]',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
