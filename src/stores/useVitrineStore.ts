'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EstadoVenda } from '@/config';

const isBrowser = typeof window !== 'undefined';

const storage = createJSONStorage(() => ({
  getItem: (name) => {
    if (!isBrowser) return null;
    const value = localStorage.getItem(name);
    return value;
  },
  setItem: (name, value) => {
    if (!isBrowser) return;
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (!isBrowser) return;
    localStorage.removeItem(name);
  },
}));

type EstadoVendaFiltro = EstadoVenda | '';

export interface VitrineFilters {
  searchTerm: string;
  estadoFiltro: EstadoVendaFiltro;
  caracteristicaFiltro: string;
  precoMin: string;
  precoMax: string;
  filtersOpen: boolean;
  searchOpen: boolean;
}

export interface VitrineViewConfig {
  viewMode: 'cards-photo' | 'cards-info' | 'table';
  ordenacao: 'recentes' | 'preco-desc' | 'preco-asc' | 'modelo';
  scrollPosition: number;
}

interface VitrineState {
  filters: VitrineFilters;
  viewConfig: VitrineViewConfig;
  setFilters: (filters: Partial<VitrineFilters>) => void;
  setViewConfig: (config: Partial<VitrineViewConfig>) => void;
  resetFilters: () => void;
  setScrollPosition: (position: number) => void;
}

const DEFAULT_FILTERS: VitrineFilters = {
  searchTerm: '',
  estadoFiltro: '',
  caracteristicaFiltro: '',
  precoMin: '',
  precoMax: '',
  filtersOpen: false,
  searchOpen: true,
};

const DEFAULT_VIEW_CONFIG: VitrineViewConfig = {
  viewMode: 'cards-photo',
  ordenacao: 'recentes',
  scrollPosition: 0,
};

export const useVitrineStore = create<VitrineState>()(
  persist(
    (set) => ({
      filters: DEFAULT_FILTERS,
      viewConfig: DEFAULT_VIEW_CONFIG,
      
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      
      setViewConfig: (config) =>
        set((state) => ({
          viewConfig: { ...state.viewConfig, ...config },
        })),
      
      resetFilters: () =>
        set({
          filters: {
            ...DEFAULT_FILTERS,
            filtersOpen: false,
            searchOpen: true,
          },
        }),
      
      setScrollPosition: (position) =>
        set((state) => ({
          viewConfig: { ...state.viewConfig, scrollPosition: position },
        })),
    }),
    {
      name: 'vitrine:state',
      storage,
      partialize: (state) => ({
        filters: state.filters,
        viewConfig: state.viewConfig,
      }),
    }
  )
);
