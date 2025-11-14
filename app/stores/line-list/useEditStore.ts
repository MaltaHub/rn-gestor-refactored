'use client';

import { create } from 'zustand';
import { DataItem, EditingRowState } from '@/app/components/estoque/line-list/types';

export interface EditStoreState<T extends DataItem> {
    editingRow: EditingRowState<T> | null;

    setEditingRow: (row: EditingRowState<T> | null) => void;
    updateEditingRowField: (key: string, value: string) => void;
    closeEditDialog: () => void;
}

export const createEditStore = <T extends DataItem>() =>
    create<EditStoreState<T>>((set) => ({
        editingRow: null,

        setEditingRow: (row) => set({ editingRow: row }),

        updateEditingRowField: (key, value) =>
            set((state) => {
                if (!state.editingRow) return state;
                return {
                    editingRow: {
                        ...state.editingRow,
                        data: {
                            ...state.editingRow.data,
                            [key]: value,
                        },
                    },
                };
            }),

        closeEditDialog: () => set({ editingRow: null }),
    }));
