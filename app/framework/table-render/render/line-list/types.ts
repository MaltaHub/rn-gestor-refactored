import type { Table } from '../../types';
import type { TableColumn } from '../../types';
import type {
  DataItem,
  NavigateConfig,
  RenderTableConfigOverrides,
  RenderTableMode,
} from '../types';

export type { DataItem, NavigateConfig, RenderTableConfigOverrides, RenderTableMode };

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
  columnId?: string;
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

export interface LineListProps<T extends DataItem> {
  table: Table;
  navigateTo?: NavigateConfig<T>;
  onDataChange?: (newData: T[]) => void;
  mode?: RenderTableMode;
  config?: RenderTableConfigOverrides;
  className?: string;
}
