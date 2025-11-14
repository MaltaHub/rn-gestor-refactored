'use client';

import { create } from 'zustand';
import { MenuPosition, RowMenuPosition } from '@/app/components/estoque/line-list/types';

export interface MenuStoreState {
    headerMenu: MenuPosition | null;
    rowMenu: RowMenuPosition | null;

    setHeaderMenu: (menu: MenuPosition | null) => void;
    setRowMenu: (menu: RowMenuPosition | null) => void;
    closeContextMenus: () => void;
}

export const createMenuStore = () =>
    create<MenuStoreState>((set) => ({
        headerMenu: null,
        rowMenu: null,

        setHeaderMenu: (menu) => set({ headerMenu: menu }),
        setRowMenu: (menu) => set({ rowMenu: menu }),
        closeContextMenus: () => set({ headerMenu: null, rowMenu: null }),
    }));
