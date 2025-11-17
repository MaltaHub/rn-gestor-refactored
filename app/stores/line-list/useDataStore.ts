'use client';

import { create } from 'zustand';
import { DataItem, SortConfig } from '@/app/components/estoque/line-list/types';

export interface DataStoreState<T extends DataItem> {
    data: T[];
    keys: string[];
    activeFilters: Record<string, string>;
    sortConfig: SortConfig | null;
    filteredAndSortedData: T[];
    invalidKeyPath: boolean;

    setData: (data: T[]) => void;
    setKeys: (keys: string[]) => void;
    setActiveFilters: (filters: Record<string, string>) => void;
    setSortConfig: (config: SortConfig | null) => void;
    setInvalidKeyPath: (invalid: boolean) => void;
    addFilter: (key: string, value: string) => void;
    removeFilter: (key: string) => void;
    clearFilters: () => void;
    addColumn: (columnName: string, position?: number) => void;
    removeColumn: (columnKey: string) => void;
    renameColumn: (currentKey: string, nextKey: string) => boolean;
    addRow: (position?: number) => void;
    updateRow: (rowId: string | number, updatedRow: T) => void;
    deleteRow: (rowId: string | number) => void;
    computeFilteredAndSorted: (data: T[], filters: Record<string, string>, sort: SortConfig | null) => T[];
}

const computeFilteredAndSorted = <T extends DataItem>(
    data: T[],
    filters: Record<string, string>,
    sort: SortConfig | null
): T[] => {
    let result = [...data];

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            result = result.filter((row) => String(row[key]).toLowerCase().includes(value.toLowerCase()));
        }
    });

    if (sort) {
        result.sort((a, b) => {
            const aValue = String(a[sort.key]);
            const bValue = String(b[sort.key]);
            return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });
    }

    return result;
};

const generateRowId = (existing: DataItem[]): string | number => {
    const base = Date.now();
    let id = base;
    const ids = new Set(existing.map((row) => row.id));
    while (ids.has(id)) {
        id += 1;
    }
    return id;
};

export const createDataStore = <T extends DataItem>() =>
    create<DataStoreState<T>>((set, get) => ({
    data: [],
    keys: [],
    activeFilters: {},
    sortConfig: null,
    filteredAndSortedData: [],
    invalidKeyPath: false,

        setData: (data) =>
            set((state) => ({
                data,
                filteredAndSortedData: computeFilteredAndSorted(data, state.activeFilters, state.sortConfig),
            })),

        setKeys: (keys) => set({ keys }),

        setActiveFilters: (filters) =>
            set((state) => ({
                activeFilters: filters,
                filteredAndSortedData: computeFilteredAndSorted(state.data, filters, state.sortConfig),
            })),

        setSortConfig: (config) =>
            set((state) => ({
                sortConfig: config,
                filteredAndSortedData: computeFilteredAndSorted(state.data, state.activeFilters, config),
            })),

        setInvalidKeyPath: (invalid) => set({ invalidKeyPath: invalid }),

        addFilter: (key, value) => {
            const state = get();
            const newFilters = { ...state.activeFilters, [key]: value };
            set({
                activeFilters: newFilters,
                filteredAndSortedData: computeFilteredAndSorted(state.data, newFilters, state.sortConfig),
            });
        },

        removeFilter: (key) => {
            const state = get();
            const newFilters = { ...state.activeFilters };
            delete newFilters[key];
            set({
                activeFilters: newFilters,
                filteredAndSortedData: computeFilteredAndSorted(state.data, newFilters, state.sortConfig),
            });
        },

        clearFilters: () => {
            const state = get();
            set({
                activeFilters: {},
                filteredAndSortedData: computeFilteredAndSorted(state.data, {}, state.sortConfig),
            });
        },

        addColumn: (columnName, position) => {
            const state = get();
            if (state.keys.includes(columnName)) {
                return;
            }
            const insertionIndex = Math.max(0, Math.min(position ?? state.keys.length, state.keys.length));
            const updatedKeys = [...state.keys];
            updatedKeys.splice(insertionIndex, 0, columnName);
            const updatedData = state.data.map((row) => ({ ...row, [columnName]: '' })) as T[];
            set({
                keys: updatedKeys,
                data: updatedData,
                filteredAndSortedData: computeFilteredAndSorted(updatedData, state.activeFilters, state.sortConfig),
            });
        },

        removeColumn: (columnKey) => {
            const state = get();
            if (state.keys.length <= 1) {
                return;
            }
            const updatedKeys = state.keys.filter((k) => k !== columnKey);
            const updatedData = state.data.map((row) => {
                const { [columnKey]: _removedColumn, ...rest } = row;
                void _removedColumn;
                return rest as T;
            });
            set({
                keys: updatedKeys,
                data: updatedData,
                filteredAndSortedData: computeFilteredAndSorted(updatedData, state.activeFilters, state.sortConfig),
            });
        },

        renameColumn: (currentKey, nextKey) => {
            const state = get();
            if (!state.keys.includes(currentKey) || state.keys.includes(nextKey)) {
                return false;
            }

            const updatedKeys = state.keys.map((key) => (key === currentKey ? nextKey : key));
            const updatedData = state.data.map((row) => {
                if (!(currentKey in row)) {
                    return row;
                }
                const { [currentKey]: value, ...rest } = row;
                return { ...rest, [nextKey]: value } as T;
            });
            const updatedFilters = Object.entries(state.activeFilters).reduce<Record<string, string>>((acc, [key, value]) => {
                acc[key === currentKey ? nextKey : key] = value;
                return acc;
            }, {});
            const updatedSortConfig = state.sortConfig?.key === currentKey ? { ...state.sortConfig, key: nextKey } : state.sortConfig;

            set({
                keys: updatedKeys,
                data: updatedData,
                activeFilters: updatedFilters,
                sortConfig: updatedSortConfig,
                filteredAndSortedData: computeFilteredAndSorted(updatedData, updatedFilters, updatedSortConfig),
            });

            return true;
        },

        addRow: (position) => {
            const state = get();
            if (state.keys.length === 0) {
                return;
            }
            const newRow = state.keys.reduce<Record<string, string | number>>(
                (acc, key) => ({ ...acc, [key]: '' }),
                { id: generateRowId(state.data) }
            ) as T;
            const insertionIndex = Math.max(0, Math.min(position ?? state.data.length, state.data.length));
            const newData = [...state.data];
            newData.splice(insertionIndex, 0, newRow);
            set({
                data: newData,
                filteredAndSortedData: computeFilteredAndSorted(newData, state.activeFilters, state.sortConfig),
            });
        },

        updateRow: (rowId, updatedRow) => {
            const state = get();
            const newData = state.data.map((row) => (row.id === rowId ? updatedRow : row));
            set({
                data: newData,
                filteredAndSortedData: computeFilteredAndSorted(newData, state.activeFilters, state.sortConfig),
            });
        },

        deleteRow: (rowId) => {
            const state = get();
            if (state.data.length <= 1) {
                return;
            }
            const newData = state.data.filter((row) => row.id !== rowId);
            set({
                data: newData,
                filteredAndSortedData: computeFilteredAndSorted(newData, state.activeFilters, state.sortConfig),
            });
        },

        computeFilteredAndSorted,
    }));
