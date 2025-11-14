'use client';

import { create } from 'zustand';

export interface UIStoreState {
    hoveredHeader: string | null;
    hoveredRow: string | number | null;

    setHoveredHeader: (key: string | null) => void;
    setHoveredRow: (rowId: string | number | null) => void;
    resetHovers: () => void;
}

export const createUIStore = () =>
    create<UIStoreState>((set) => ({
        hoveredHeader: null,
        hoveredRow: null,

        setHoveredHeader: (key) => set({ hoveredHeader: key }),
        setHoveredRow: (rowId) => set({ hoveredRow: rowId }),
        resetHovers: () => set({ hoveredHeader: null, hoveredRow: null }),
    }));
