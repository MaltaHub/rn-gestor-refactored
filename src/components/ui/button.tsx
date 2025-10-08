import { ButtonHTMLAttributes, forwardRef, ReactNode, CSSProperties } from 'react';
import { SPACING, FONT_SIZE, BORDER_RADIUS, TRANSITIONS } from '@/config';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  customColor?: {
    bg?: string;
    text?: string;
    hover?: string;
    focus?: string;
  };
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    customColor,
    icon,
    iconPosition = 'left',
    className = '', 
    children, 
    disabled,
    style, 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[var(--purple-dark)] text-[var(--white-pure)] hover:bg-[var(--purple-darker)] focus:ring-[var(--purple-light)] active:bg-[var(--purple-darker)] shadow-sm',
      secondary: 'bg-[var(--jungle-dark)] text-[var(--white-pure)] hover:bg-[var(--jungle-dark)]/90 focus:ring-[var(--jungle-light)] active:bg-[var(--jungle-dark)]/80 shadow-sm',
      outline: 'border-2 border-[var(--purple-dark)] text-[var(--purple-dark)] hover:bg-[var(--purple-pale)] focus:ring-[var(--purple-light)] dark:border-[var(--purple-light)] dark:text-[var(--purple-light)] dark:hover:bg-[var(--purple-dark)]/20',
      ghost: 'hover:bg-[var(--purple-pale)] text-[var(--purple-darker)] focus:ring-[var(--purple-light)] dark:text-[var(--purple-light)] dark:hover:bg-[var(--purple-dark)]/20',
      danger: 'bg-[var(--danger-dark)] text-[var(--white-pure)] hover:bg-[var(--danger)] focus:ring-[var(--danger-light)] active:bg-[var(--danger)] shadow-sm',
    };

    const sizeStyles: Record<string, CSSProperties> = {
      sm: {
        paddingLeft: SPACING.md,
        paddingRight: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.sm,
        fontSize: FONT_SIZE.sm,
        borderRadius: BORDER_RADIUS.md,
      },
      md: {
        paddingLeft: SPACING.lg,
        paddingRight: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.md,
        fontSize: FONT_SIZE.base,
        borderRadius: BORDER_RADIUS.lg,
      },
      lg: {
        paddingLeft: SPACING.xl,
        paddingRight: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.lg,
        fontSize: FONT_SIZE.lg,
        borderRadius: BORDER_RADIUS.xl,
      },
    };

    const customStyle: CSSProperties = {
      ...sizeStyles[size],
      transition: TRANSITIONS.base,
      ...(customColor && {
        backgroundColor: customColor.bg,
        color: customColor.text,
        ...(customColor.hover && {
          '--custom-hover-bg': customColor.hover,
        } as any),
        ...(customColor.focus && {
          '--custom-focus-ring': customColor.focus,
        } as any),
      }),
      ...style,
    };

    const LoadingSpinner = () => (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    const customHoverClass = customColor?.hover ? '[&:hover]:bg-[var(--custom-hover-bg)]' : '';
    const customFocusClass = customColor?.focus ? '[&:focus]:ring-[var(--custom-focus-ring)]' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${customColor ? `${customHoverClass} ${customFocusClass}` : variants[variant]} ${className}`}
        style={customStyle}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {!isLoading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {!isLoading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
