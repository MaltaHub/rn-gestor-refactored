import { HTMLAttributes, forwardRef } from 'react';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-gray-400 dark:text-gray-600">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
            {description}
          </p>
        )}
        {action}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
