import type { Table } from '@/app/framework/table-render';
import type { TableColumn } from '@/app/framework/table-render/types';

export type DataItem = { id: string | number; [key: string]: string | number };

export type LineListMode = 'read-only' | 'edit' | 'cell-edit';

export interface NavigateConfig<T extends DataItem> {
    path: string;
    keyPath: keyof T;
}

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export interface MenuPosition {
    columnId: string;
    label: string;
    x: number;
    y: number;
}

export interface RowMenuPosition {
    rowId: string | number;
    x: number;
    y: number;
}

export interface FilterDialogState {
    columnId: string;
    label: string;
    x: number;
    y: number;
}

export interface EditingRowState<T extends DataItem> {
    rowId: string | number;
    data: T;
}

export interface LineListColumnMeta {
    column: TableColumn;
    label: string;
}

export interface LineCardsProps<T extends DataItem> {
    table: Table;
    navigateTo?: NavigateConfig<T>;
    onDataChange?: (newData: T[]) => void;
    mode?: LineListMode;
}
