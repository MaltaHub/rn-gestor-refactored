import { QueryClient } from '@tanstack/react-query'

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000
const TEN_MINUTES_IN_MS = 10 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mantem dados frescos por 5 minutos e evita refetch acidental em montagens simultaneas
      staleTime: FIVE_MINUTES_IN_MS,
      gcTime: TEN_MINUTES_IN_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: 'ifStale',
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
