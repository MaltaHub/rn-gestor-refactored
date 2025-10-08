'use client';

/**
 * SuspenseBoundary
 * Componente de suspense com fallback customizável
 */

import { Suspense, ReactNode } from 'react';
import { Skeleton } from './skeleton';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  type?: 'card' | 'list' | 'table' | 'custom';
}

const defaultFallbacks: Record<string, ReactNode> = {
  card: (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
  list: (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  ),
  table: (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  ),
  custom: <Skeleton className="h-32 w-full" />,
};

export function SuspenseBoundary({ 
  children, 
  fallback, 
  type = 'card' 
}: SuspenseBoundaryProps) {
  const defaultFallback = defaultFallbacks[type] ?? defaultFallbacks.card;

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}
