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
      default: 'bg-[var(--gray-whisper)] text-zinc-900 dark:bg-zinc-700 dark:text-zinc-200',
      success: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-[var(--warning-pale)] text-[var(--warning)] dark:bg-[var(--warning)]/30 dark:text-[var(--warning-light)]',
      danger: 'bg-[var(--danger-pale)] text-[var(--danger)] dark:bg-[var(--danger)]/30 dark:text-[var(--danger-light)]',
      info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
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
