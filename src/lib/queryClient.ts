import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Evitar "tempestade" de refetch entre múltiplos componentes
      staleTime: Infinity, // 5 min
      gcTime: 1000 * 60 * 5,   // 10 min (v5: gcTime substitui cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})