import { HTMLAttributes, forwardRef, CSSProperties } from 'react';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/config';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  customColors?: {
    bg?: string;
    text?: string;
  };
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', customColors, className = '', children, style, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium';
    
    const variants = {
      default: 'bg-[var(--gray-whisper)] text-[var(--foreground)] dark:bg-[var(--purple-dark)]/20 dark:text-[var(--foreground)]',
      success: 'bg-[var(--jungle-pale)] text-[var(--jungle-dark)] dark:bg-[var(--jungle-dark)] dark:text-[var(--jungle-pale)]',
      warning: 'bg-[var(--warning-pale)] text-[var(--warning)] dark:bg-[var(--warning)]/30 dark:text-[var(--warning-light)]',
      danger: 'bg-[var(--danger-pale)] text-[var(--danger)] dark:bg-[var(--danger)]/30 dark:text-[var(--danger-light)]',
      info: 'bg-[var(--purple-pale)] text-[var(--purple-dark)] dark:bg-[var(--purple-dark)] dark:text-[var(--purple-pale)]',
    };

    const sizeStyles: Record<string, CSSProperties> = {
      sm: {
        paddingLeft: SPACING.sm,
        paddingRight: SPACING.sm,
        paddingTop: SPACING.xs,
        paddingBottom: SPACING.xs,
        fontSize: FONT_SIZE.xs,
        borderRadius: BORDER_RADIUS.full,
      },
      md: {
        paddingLeft: SPACING.md,
        paddingRight: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.sm,
        fontSize: FONT_SIZE.sm,
        borderRadius: BORDER_RADIUS.full,
      },
    };

    const badgeStyle: CSSProperties = {
      ...sizeStyles[size],
      ...(customColors && {
        backgroundColor: customColors.bg,
        color: customColors.text,
      }),
      ...style,
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${customColors ? '' : variants[variant]} ${className}`}
        style={badgeStyle}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
