/**
 * Table Store Factory
 * Cria stores Zustand especializadas para cada instância de tabela
 * Separação entre estado de dados (rows, columns) e estado de UI (filtros, ordenação, etc)
 */

import { create } from 'zustand';
import {
  TableRow,
  TableFilter,
  TableSort,
  TableSnapshot,
  TableHistoryEntry,
  TableColumn,
  CompiledExpression,
} from './types';

/**
 * Store de dados: gerencia linhas e colunas da tabela
 */
export interface DataStoreState {
  rows: TableRow[];
  columns: TableColumn[];
  filteredRows: TableRow[];
  sortedRows: TableRow[];

  setRows: (rows: TableRow[]) => void;
  setColumns: (columns: TableColumn[]) => void;
  addRow: (row: TableRow) => void;
  updateRow: (rowId: string | number, changes: Partial<TableRow>) => void;
  deleteRow: (rowId: string | number) => void;
  updateColumn: (columnId: string, updates: Partial<TableColumn>) => void;
  addColumn: (column: TableColumn) => void;
  deleteColumn: (columnId: string) => void;
  getRow: (rowId: string | number) => TableRow | undefined;
  getColumn: (columnId: string) => TableColumn | undefined;
}

export const createDataStore = (initialRows: TableRow[], initialColumns: TableColumn[]) => {
  return create<DataStoreState>((set, get) => ({
    rows: initialRows,
    columns: initialColumns,
    filteredRows: initialRows,
    sortedRows: initialRows,

    setRows: (rows) => set({ rows, filteredRows: rows, sortedRows: rows }),
    setColumns: (columns) => set({ columns }),

    addRow: (row) =>
      set((state) => {
        const newRows = [...state.rows, row];
        return { rows: newRows, filteredRows: newRows, sortedRows: newRows };
      }),

    updateRow: (rowId, changes) =>
      set((state) => {
        const newRows = state.rows.map((row) => (row.id === rowId ? { ...row, ...changes } : row));
        return { rows: newRows, filteredRows: newRows, sortedRows: newRows };
      }),

    deleteRow: (rowId) =>
      set((state) => {
        const newRows = state.rows.filter((row) => row.id !== rowId);
        return { rows: newRows, filteredRows: newRows, sortedRows: newRows };
      }),

    updateColumn: (columnId, updates) =>
      set((state) => ({
        columns: state.columns.map((col) => (col.id === columnId ? { ...col, ...updates } : col)),
      })),

    addColumn: (column) =>
      set((state) => ({
        columns: [...state.columns, column],
      })),

    deleteColumn: (columnId) =>
      set((state) => ({
        columns: state.columns.filter((col) => col.id !== columnId),
      })),

    getRow: (rowId) => {
      return get().rows.find((row) => row.id === rowId);
    },

    getColumn: (columnId) => {
      return get().columns.find((col) => col.id === columnId);
    },
  }));
};

/**
 * Store de filtros: gerencia filtros aplicados à tabela
 */
export interface FilterStoreState {
  filters: TableFilter[];
  addFilter: (filter: TableFilter) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  updateFilter: (filterId: string, updates: Partial<TableFilter>) => void;
  getFilter: (filterId: string) => TableFilter | undefined;
}

export const createFilterStore = () => {
  return create<FilterStoreState>((set, get) => ({
    filters: [],

    addFilter: (filter) =>
      set((state) => ({
        filters: [...state.filters, filter],
      })),

    removeFilter: (filterId) =>
      set((state) => ({
        filters: state.filters.filter((f) => f.id !== filterId),
      })),

    clearFilters: () => set({ filters: [] }),

    updateFilter: (filterId, updates) =>
      set((state) => ({
        filters: state.filters.map((f) => (f.id === filterId ? { ...f, ...updates } : f)),
      })),

    getFilter: (filterId) => {
      return get().filters.find((f) => f.id === filterId);
    },
  }));
};

/**
 * Store de ordenação: gerencia ordenação da tabela
 */
export interface SortStoreState {
  sorts: TableSort[];
  setSorts: (sorts: TableSort[]) => void;
  addSort: (sort: TableSort) => void;
  removeSort: (columnId: string) => void;
  clearSorts: () => void;
}

export const createSortStore = () => {
  return create<SortStoreState>((set) => ({
    sorts: [],

    setSorts: (sorts) => set({ sorts }),

    addSort: (sort) =>
      set((state) => {
        // Remove ordenação anterior desta coluna, se existir
        const newSorts = state.sorts.filter((s) => s.columnId !== sort.columnId);
        return { sorts: [...newSorts, sort] };
      }),

    removeSort: (columnId) =>
      set((state) => ({
        sorts: state.sorts.filter((s) => s.columnId !== columnId),
      })),

    clearSorts: () => set({ sorts: [] }),
  }));
};

/**
 * Store de histórico: registra todas as mudanças
 */
export interface HistoryStoreState {
  entries: TableHistoryEntry[];
  addEntry: (entry: TableHistoryEntry) => void;
  clearHistory: () => void;
  getEntriesSince: (timestamp: number) => TableHistoryEntry[];
}

export const createHistoryStore = () => {
  return create<HistoryStoreState>((set, get) => ({
    entries: [],

    addEntry: (entry) =>
      set((state) => ({
        entries: [...state.entries, entry],
      })),

    clearHistory: () => set({ entries: [] }),

    getEntriesSince: (timestamp) => {
      return get().entries.filter((e) => e.timestamp >= timestamp);
    },
  }));
};

/**
 * Store de snapshots: armazena snapshots da tabela
 */
export interface SnapshotStoreState {
  snapshots: TableSnapshot[];
  addSnapshot: (snapshot: TableSnapshot) => void;
  removeSnapshot: (index: number) => void;
  clearSnapshots: () => void;
  getLatestSnapshot: () => TableSnapshot | undefined;
}

export const createSnapshotStore = () => {
  return create<SnapshotStoreState>((set, get) => ({
    snapshots: [],

    addSnapshot: (snapshot) =>
      set((state) => ({
        snapshots: [...state.snapshots, snapshot],
      })),

    removeSnapshot: (index) =>
      set((state) => ({
        snapshots: state.snapshots.filter((_, i) => i !== index),
      })),

    clearSnapshots: () => set({ snapshots: [] }),

    getLatestSnapshot: () => {
      const snapshots = get().snapshots;
      return snapshots.length > 0 ? snapshots[snapshots.length - 1] : undefined;
    },
  }));
};

/**
 * Store de colunas dinâmicas: cacheia expressões compiladas
 */
export interface DynamicColumnStoreState {
  compiledExpressions: Map<string, CompiledExpression>;
  setCompiledExpression: (columnId: string, compiled: CompiledExpression) => void;
  getCompiledExpression: (columnId: string) => CompiledExpression | undefined;
  clearCompiledExpressions: () => void;
}

export const createDynamicColumnStore = () => {
  return create<DynamicColumnStoreState>((set, get) => ({
    compiledExpressions: new Map(),

    setCompiledExpression: (columnId, compiled) =>
      set((state) => {
        const newMap = new Map(state.compiledExpressions);
        newMap.set(columnId, compiled);
        return { compiledExpressions: newMap };
      }),

    getCompiledExpression: (columnId) => {
      return get().compiledExpressions.get(columnId);
    },

    clearCompiledExpressions: () => set({ compiledExpressions: new Map() }),
  }));
};
