'use client';

import { create } from 'zustand';

export interface DragStoreState {
    draggedIndex: number | null;
    dragOverIndex: number | null;

    setDraggedIndex: (index: number | null) => void;
    setDragOverIndex: (index: number | null) => void;
    resetDrag: () => void;
}

export const createDragStore = () =>
    create<DragStoreState>((set) => ({
        draggedIndex: null,
        dragOverIndex: null,

        setDraggedIndex: (index) => set({ draggedIndex: index }),
        setDragOverIndex: (index) => set({ dragOverIndex: index }),
        resetDrag: () => set({ draggedIndex: null, dragOverIndex: null }),
    }));
