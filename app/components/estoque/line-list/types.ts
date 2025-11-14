export type DataItem = { id: string | number; [key: string]: string | number };

export type LineListMode = 'read-only' | 'edit';

export interface NavigateConfig<T extends DataItem> {
    path: string;
    keyPath: keyof T;
}

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export interface MenuPosition {
    key: string;
    x: number;
    y: number;
}

export interface RowMenuPosition {
    rowId: string | number;
    x: number;
    y: number;
}

export interface FilterDialogState {
    key: string;
    x: number;
    y: number;
}

export interface EditingRowState<T extends DataItem> {
    rowId: string | number;
    data: T;
}

export interface LineCardsProps<T extends DataItem> {
    data: T[];
    navigateTo?: NavigateConfig<T>;
    onDataChange?: (newData: T[]) => void;
    mode?: LineListMode;
}
