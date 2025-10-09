'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config';
import type { VeiculoUI } from '@/adapters/adaptador-estoque';

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

export interface EstoqueFilters {
  termo: string;
  estadoVendaSelecionado: VeiculoUI['estado_venda'] | 'todos';
  localIdFiltro: string;
  modelosFiltro: string[];
  filtrosVisiveis: boolean;
}

export interface EstoqueViewConfig {
  viewMode: 'table';
  scrollPosition: number;
  sortKey: string | null;
  sortDirection: 'asc' | 'desc';
  columnWidths: Record<string, number>;
}

interface EstoqueState {
  filters: EstoqueFilters;
  viewConfig: EstoqueViewConfig;
  setFilters: (filters: Partial<EstoqueFilters>) => void;
  setViewConfig: (config: Partial<EstoqueViewConfig>) => void;
  resetFilters: () => void;
  setScrollPosition: (position: number) => void;
  setColumnWidth: (columnKey: string, width: number) => void;
}

const DEFAULT_FILTERS: EstoqueFilters = {
  termo: '',
  estadoVendaSelecionado: 'todos',
  localIdFiltro: '',
  modelosFiltro: [],
  filtrosVisiveis: false,
};

const DEFAULT_VIEW_CONFIG: EstoqueViewConfig = {
  viewMode: 'table',
  scrollPosition: 0,
  sortKey: null,
  sortDirection: 'asc',
  columnWidths: {},
};

export const useEstoqueStore = create<EstoqueState>()(
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
          filters: DEFAULT_FILTERS,
        }),
      
      setScrollPosition: (position) =>
        set((state) => ({
          viewConfig: { ...state.viewConfig, scrollPosition: position },
        })),
      
      setColumnWidth: (columnKey, width) =>
        set((state) => ({
          viewConfig: {
            ...state.viewConfig,
            columnWidths: {
              ...state.viewConfig.columnWidths,
              [columnKey]: width,
            },
          },
        })),
    }),
    {
      name: STORAGE_KEYS.estoqueState,
      storage,
      partialize: (state) => ({
        filters: state.filters,
        viewConfig: state.viewConfig,
      }),
    }
  )
);
