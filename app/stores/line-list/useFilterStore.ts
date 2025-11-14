'use client';

import { create } from 'zustand';
import { FilterDialogState } from '@/app/components/estoque/line-list/types';

export interface FilterStoreState {
    filterDialog: FilterDialogState | null;
    filterValue: string;

    setFilterDialog: (dialog: FilterDialogState | null) => void;
    setFilterValue: (value: string) => void;
    closeFilterDialog: () => void;
}

export const createFilterStore = () =>
    create<FilterStoreState>((set) => ({
        filterDialog: null,
        filterValue: '',

        setFilterDialog: (dialog) => set({ filterDialog: dialog }),
        setFilterValue: (value) => set({ filterValue: value }),
        closeFilterDialog: () => set({ filterDialog: null, filterValue: '' }),
    }));
