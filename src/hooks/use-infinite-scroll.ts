/**
 * useInfiniteScroll Hook
 * Hook para implementar scroll infinito com paginação
 */

import { useEffect } from 'react';
import { useIntersectionObserver } from './use-intersection-observer';

interface UseInfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  enabled?: boolean;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  enabled = true,
}: UseInfiniteScrollProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    enabled: enabled && hasMore && !isLoading,
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, isLoading, onLoadMore]);

  return { ref };
}
