import { InputHTMLAttributes, forwardRef, useId, CSSProperties } from 'react';
import { SPACING, FONT_SIZE, BORDER_RADIUS, TRANSITIONS } from '@/config';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  customColors?: {
    border?: string;
    focus?: string;
    bg?: string;
    text?: string;
  };
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    leftIcon, 
    rightIcon, 
    inputSize = 'md', 
    customColors,
    className = '', 
    id: providedId,
    style,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    const sizeMap = {
      sm: {
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.sm,
        paddingLeft: leftIcon ? '2.5rem' : SPACING.md,
        paddingRight: rightIcon ? '2.5rem' : SPACING.md,
        fontSize: FONT_SIZE.sm,
        borderRadius: BORDER_RADIUS.md,
      },
      md: {
        paddingTop: SPACING.md,
        paddingBottom: SPACING.md,
        paddingLeft: leftIcon ? '2.5rem' : SPACING.lg,
        paddingRight: rightIcon ? '2.5rem' : SPACING.lg,
        fontSize: FONT_SIZE.base,
        borderRadius: BORDER_RADIUS.lg,
      },
      lg: {
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.lg,
        paddingLeft: leftIcon ? '3rem' : SPACING.xl,
        paddingRight: rightIcon ? '3rem' : SPACING.xl,
        fontSize: FONT_SIZE.lg,
        borderRadius: BORDER_RADIUS.xl,
      },
    };

    const inputStyle: CSSProperties = {
      ...sizeMap[inputSize],
      transition: TRANSITIONS.base,
      ...(customColors && {
        backgroundColor: customColors.bg,
        color: customColors.text,
        borderColor: customColors.border,
        ...(customColors.focus && {
          '--custom-focus-ring': customColors.focus,
        } as any),
      }),
      ...style,
    };

    const customFocusClass = customColors?.focus ? '[&:focus]:ring-[var(--custom-focus-ring)] [&:focus]:border-[var(--custom-focus-ring)]' : '';

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block font-medium text-[var(--foreground)]"
            style={{ 
              fontSize: FONT_SIZE.sm, 
              marginBottom: SPACING.sm 
            }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 text-[var(--foreground)]/40"
              style={{ left: SPACING.md }}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={errorId}
            className={`
              w-full border transition-all
              ${error 
                ? 'border-[var(--danger)] focus:ring-[var(--danger)] focus:border-[var(--danger)]' 
                : customColors
                  ? `focus:ring-2 ${customFocusClass}`
                  : 'border-[var(--gray-light)] dark:border-[var(--purple-dark)]/30 focus:ring-[var(--purple-magic)] focus:border-[var(--purple-magic)]'
              }
              ${!customColors && 'bg-[var(--white-pure)] dark:bg-[var(--surface-dark)] text-[var(--foreground)]'}
              placeholder:text-[var(--foreground)]/40
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            style={inputStyle}
            {...props}
          />
          {rightIcon && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 text-[var(--foreground)]/40"
              style={{ right: SPACING.md }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p 
            id={errorId} 
            className="text-[var(--danger)] dark:text-[var(--danger-light)]" 
            role="alert"
            style={{
              marginTop: SPACING.sm,
              fontSize: FONT_SIZE.sm,
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
