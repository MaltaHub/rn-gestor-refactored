import React, { ButtonHTMLAttributes, forwardRef, ReactNode, CSSProperties } from 'react';
import { SPACING, FONT_SIZE, BORDER_RADIUS, TRANSITIONS } from '@/config';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean;
  customColor?: {
    bg?: string;
    text?: string;
    hover?: string;
    focus?: string;
  };
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    customColor,
    icon,
    iconPosition = 'left',
    leftIcon,
    rightIcon,
    className = '', 
    children, 
    disabled,
    style,
    asChild,
    ...props 
  }, ref) => {
    const finalIcon = leftIcon || rightIcon || icon;
    const finalIconPosition = leftIcon ? 'left' : rightIcon ? 'right' : iconPosition;
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-[var(--purple-dark)] text-[var(--white-pure)] hover:bg-[var(--purple-darker)] focus:ring-[var(--purple-light)] active:bg-[var(--purple-darker)] shadow-sm',
      secondary: 'bg-zinc-600 text-white hover:bg-zinc-700 focus:ring-zinc-400 active:bg-zinc-700 shadow-sm',
      outline: 'border-2 border-[var(--purple-dark)] text-[var(--purple-dark)] hover:bg-gray-50 focus:ring-[var(--purple-light)] dark:border-[var(--purple-light)] dark:text-[var(--purple-light)] dark:hover:bg-zinc-800',
      ghost: 'hover:bg-gray-100 text-[var(--purple-darker)] focus:ring-[var(--purple-light)] dark:text-[var(--purple-light)] dark:hover:bg-zinc-700',
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

    const Comp = asChild && React.isValidElement(children) ? (children.type as any) : 'button';
    const childProps = asChild && React.isValidElement(children) ? (children.props as any) : {};

    return (
      <Comp
        ref={ref}
        className={`${baseStyles} ${customColor ? `${customHoverClass} ${customFocusClass}` : variants[variant]} ${className}`}
        style={customStyle}
        disabled={disabled || isLoading}
        {...(childProps || {})}
        {...props}
      >
        {!asChild && isLoading && <LoadingSpinner />}
        {!asChild && !isLoading && finalIcon && finalIconPosition === 'left' && <span className="mr-2">{finalIcon}</span>}
        {asChild && React.isValidElement(children) ? (children.props as any).children : children}
        {!asChild && !isLoading && finalIcon && finalIconPosition === 'right' && <span className="ml-2">{finalIcon}</span>}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
