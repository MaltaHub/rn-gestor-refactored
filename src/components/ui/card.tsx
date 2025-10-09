import { HTMLAttributes, forwardRef, ReactNode, CSSProperties } from 'react';
import { SPACING, BORDER_RADIUS } from '@/config';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof SPACING;
  customColors?: {
    bg?: string;
    border?: string;
  };
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'xl', customColors, className = '', children, style, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--white-pure)] dark:bg-[var(--surface-dark)] border border-[var(--gray-whisper)] dark:border-[var(--purple-dark)]/30',
      elevated: 'bg-[var(--white-pure)] dark:bg-[var(--surface-dark)] shadow-lg shadow-[var(--purple-magic)]/5',
      outlined: 'border-2 border-[var(--purple-magic)]/30 dark:border-[var(--purple-light)]/30',
    };

    const cardStyle: CSSProperties = {
      padding: SPACING[padding],
      borderRadius: BORDER_RADIUS.xl,
      ...(customColors && {
        backgroundColor: customColors.bg,
        borderColor: customColors.border,
      }),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`${customColors ? 'border' : variants[variant]} ${className}`}
        style={cardStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardRoot.displayName = 'Card';

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between gap-4 ${className}`}
        style={{ marginBottom: SPACING.lg, ...style }}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-[var(--foreground)]/60 mt-1">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'Card.Header';

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'Card.Body';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'right', className = '', children, style, ...props }, ref) => {
    const alignments = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={`flex items-center gap-3 ${alignments[align]} ${className}`}
        style={{ marginTop: SPACING.lg, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'Card.Footer';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
