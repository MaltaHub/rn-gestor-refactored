import type { ReactNode } from 'react';
import type { Table, TableCellValue } from '../types';
import type { TableColumn, TableFilter } from '../types';

export type DataItem = { id: string | number; [key: string]: TableCellValue };

export type RenderTableMode = 'read-only' | 'edit' | 'cell-edit';

export interface NavigateConfig<T extends DataItem> {
  path: string;
  keyPath: keyof T;
}

export interface RenderTableLabels {
  dynamicColumnBadge: string;
  addColumnAfter: (label: string) => string;
  addRowAbove: (rowId: string | number) => string;
  addRowTitle: string;
  sortAsc: string;
  sortDesc: string;
  filter: string;
  filterActive: string;
  clearFilter: string;
  addColumn: string;
  newColumnName: string;
  removeColumn: string;
  renameColumn: string;
  editRow: string;
  deleteRow: string;
  duplicateRow: string;
  hideColumn: string;
  hiddenColumnsTitle: string;
  showColumn: string;
  filterDialogTitle: (label: string) => string;
  filterPlaceholder: string;
  apply: string;
  cancel: string;
  editRowTitle: string;
  save: string;
  emptyCell: string;
  emptyState: string;
  promptRenameColumn: (label: string) => string;
  confirmRemoveColumn: (label: string) => string;
  confirmDeleteRow: (rowId: string | number) => string;
  alertMinColumns: string;
  alertMinRows: string;
  alertReadOnly: string;
  alertNoColumns: string;
}

export interface RenderTableInteractions {
  alert: (message: string) => void;
  confirm: (message: string) => boolean | Promise<boolean>;
  prompt: (message: string, defaultValue?: string) => string | null | Promise<string | null>;
}

export interface RenderTablePermissions {
  canEditHeaders: boolean;
  canStructureEdit: boolean;
  allowColumnReorder: boolean;
  canEditRows: boolean;
  isReadOnly: boolean;
}

export interface RenderTableFormatValueParams {
  value: TableCellValue;
  column: TableColumn;
  rowId: string | number;
  table: Table;
}

export interface RenderTableConfig {
  labels: RenderTableLabels;
  interactions: RenderTableInteractions;
  formatValue: (params: RenderTableFormatValueParams) => ReactNode;
  columnIdFactory: (base: string, existing: Set<string>) => string;
  buildEmptyRow: (columns: TableColumn[]) => Record<string, TableCellValue>;
  filter: {
    operator: TableFilter['operator'];
    caseSensitive: boolean;
  };
  permissionsResolver?: (table: Table, mode: RenderTableMode) => Partial<RenderTablePermissions>;
  onError?: (error: unknown) => void;
  onColumnOrderChange?: (order: string[]) => void;
}

export type RenderTableConfigOverrides = Partial<Omit<RenderTableConfig, 'labels' | 'interactions' | 'filter'>> & {
  labels?: Partial<RenderTableLabels>;
  interactions?: Partial<RenderTableInteractions>;
  filter?: Partial<RenderTableConfig['filter']>;
};

export interface RenderTableProps<T extends DataItem> {
  table: Table;
  navigateTo?: NavigateConfig<T>;
  onDataChange?: (newData: T[]) => void;
  mode?: RenderTableMode;
  config?: RenderTableConfigOverrides;
  className?: string;
}
