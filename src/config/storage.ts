/**
 * Chaves de localStorage centralizadas
 * Evita duplicação e erros de digitação
 */

export const STORAGE_KEYS = {
  // Vitrine
  vitrine: {
    viewMode: 'vitrine:view-mode',
    filtersOpen: 'vitrine:filters-open',
    searchOpen: 'vitrine:search-open',
    statusValue: 'vitrine:status-value',
    characteristicValue: 'vitrine:characteristic-value',
    priceMin: 'vitrine:price-min-value',
    priceMax: 'vitrine:price-max-value',
    sortValue: 'vitrine:sort-value',
  },
  
  // Estoque
  estoque: {
    viewMode: 'estoque:viewMode',
    searchTerm: 'estoque:searchTerm',
    localScope: 'estoque:localScope',
    localFiltro: 'estoque:localFiltro',
    modeloFiltro: 'estoque:modeloFiltro',
    sortConfig: 'estoque:sortConfig',
    searchOpen: 'estoque:searchOpen',
  },
  
  // Estoque State (Zustand)
  estoqueState: 'estoque:state',
  
  // Loja selecionada (Zustand)
  lojaSelecionada: 'vitrine:loja-selecionada',
  
  // Tema (futuro)
  theme: {
    mode: 'app:theme-mode',
    customColors: 'app:theme-custom-colors',
  },
} as const;

// Tipos helper para type safety
export type VitrineStorageKey = keyof typeof STORAGE_KEYS.vitrine;
export type EstoqueStorageKey = keyof typeof STORAGE_KEYS.estoque;
export type ThemeStorageKey = keyof typeof STORAGE_KEYS.theme;
