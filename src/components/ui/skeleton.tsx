import { HTMLAttributes, forwardRef } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'rectangular', className = '', ...props }, ref) => {
    const baseStyles = 'animate-pulse bg-gray-200 dark:bg-gray-700';
    
    const variants = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
