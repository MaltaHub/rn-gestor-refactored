/**
 * Constantes gerais da aplicação
 * Centralizadas para facilitar manutenção e configuração
 */

// Limites e restrições
export const LIMITS = {
  MAX_FOTOS: 30,
  MAX_UPLOAD_SIZE_MB: 10,
} as const;

// Buckets do Supabase Storage
export const STORAGE_BUCKETS = {
  FOTOS_VEICULOS_LOJA: 'fotos_veiculos_loja',
  DOCUMENTOS_VEICULOS: 'documentos_veiculos',
} as const;

// Nomes de RPC Functions do Supabase
export const RPC_FUNCTIONS = {
  CONFIGURACOES: 'rpc_configuracoes',
  VEICULOS: 'rpc_veiculos',
} as const;

// Estados de venda possíveis
export const ESTADOS_VENDA = [
  'disponivel',
  'reservado',
  'vendido',
  'repassado',
  'restrito',
] as const;

export type EstadoVenda = (typeof ESTADOS_VENDA)[number];

// Valores especiais
export const SPECIAL_VALUES = {
  SEM_LOCAL: '__sem_local__',
} as const;
