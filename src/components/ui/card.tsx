import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverable = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-xl transition-all duration-200';
    
    const variants = {
      default: 'bg-[var(--white-pure)] dark:bg-[var(--surface-dark)] border border-[var(--gray-whisper)] dark:border-[var(--purple-dark)]/30',
      elevated: 'bg-[var(--white-pure)] dark:bg-[var(--surface-dark)] shadow-lg shadow-[var(--purple-magic)]/5',
      outlined: 'border-2 border-[var(--purple-magic)]/30 dark:border-[var(--purple-light)]/30',
    };

    const hoverStyles = hoverable ? 'hover:shadow-xl hover:shadow-[var(--purple-magic)]/10 hover:scale-[1.02] cursor-pointer hover:border-[var(--purple-magic)]/50' : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h3 ref={ref} className={`text-xl font-semibold text-[var(--foreground)] ${className}`} {...props}>
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`px-6 pb-6 ${className}`} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';
