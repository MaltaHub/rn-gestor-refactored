/**
 * Configurações de cache para React Query
 * Centralizadas para consistência em toda a aplicação
 */

export const CACHE_TIMES = {
  // Tempo padrão que os dados ficam "fresh" antes de refetch
  STANDARD: 1000 * 60 * 5,        // 5 minutos
  SHORT: 1000 * 60,               // 1 minuto
  VERY_SHORT: 1000 * 30,          // 30 segundos
  LONG: 1000 * 60 * 10,           // 10 minutos
} as const;

export const RETRY_CONFIG = {
  DEFAULT: 2,
  NO_RETRY: 0,
  AGGRESSIVE: 3,
} as const;

// Configurações específicas por tipo de dado
export const QUERY_CONFIG = {
  // Configurações (lojas, modelos, características, etc)
  configuracoes: {
    staleTime: CACHE_TIMES.STANDARD,
    retry: RETRY_CONFIG.DEFAULT,
  },
  
  // Veículos
  veiculos: {
    staleTime: CACHE_TIMES.STANDARD,
    retry: RETRY_CONFIG.DEFAULT,
  },
  
  // Dados de empresa/membros
  empresa: {
    staleTime: CACHE_TIMES.STANDARD,
    retry: RETRY_CONFIG.DEFAULT,
  },

  // Vendas
  vendas: {
    staleTime: CACHE_TIMES.SHORT,
    retry: RETRY_CONFIG.DEFAULT,
  },
  
  // Admin (dados mais voláteis)
  admin: {
    empresas: {
      staleTime: CACHE_TIMES.STANDARD,
      retry: RETRY_CONFIG.DEFAULT,
    },
    membros: {
      staleTime: CACHE_TIMES.SHORT,
      retry: RETRY_CONFIG.DEFAULT,
    },
    usuarios: {
      staleTime: CACHE_TIMES.VERY_SHORT,
      retry: RETRY_CONFIG.DEFAULT,
    },
  },
} as const;
