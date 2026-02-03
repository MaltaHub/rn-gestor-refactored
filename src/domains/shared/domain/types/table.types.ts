/**
 * Table Entity Types
 */

export type TableCellValue = string | number | boolean | null | undefined;

export interface TableRow {
  id: string | number;
  [key: string]: TableCellValue;
}

export interface TableColumn {
  id: string;
  alias?: string;
  dataSource: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'currency' | 'custom';
  isDynamic: boolean;
  expression?: string;
  isReadOnly?: boolean;
  order: number;
  isHidden?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
  width?: string;
}

export interface TableFilter {
  id: string;
  columnId: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
  value: TableCellValue | TableCellValue[];
  caseSensitive?: boolean;
}

export interface TableSort {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface TableSnapshot {
  tableId: string;
  timestamp: number;
  rows: TableRow[];
  filters: TableFilter[];
  sorts: TableSort[];
  columns: TableColumn[];
  contentHash: string;
}

export interface TableHistoryEntry {
  operation: 'create' | 'update' | 'delete' | 'filter' | 'sort' | 'column_add' | 'column_delete' | 'column_rename';
  timestamp: number;
  rowId?: string | number;
  columnId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  userId?: string;
  description: string;
}

export interface TableCallbacks {
  onCreate?: (row: TableRow) => Promise<void>;
  onUpdate?: (rowId: string | number, changes: Partial<TableRow>) => Promise<void>;
  onDelete?: (rowId: string | number) => Promise<void>;
  onRenameColumn?: (columnId: string, newAlias: string) => Promise<void>;
  onDeleteColumn?: (columnId: string) => Promise<void>;
  onAddDynamicColumn?: (column: TableColumn) => Promise<void>;
}

export interface ColumnValidation {
  validators?: Array<(value: TableCellValue) => boolean | string>;
  max?: number;
  min?: number;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  pattern?: RegExp;
}

export interface CompiledExpression {
  originalExpression: string;
  compute: (row: TableRow, tables: Map<string, any>, allRows?: TableRow[]) => TableCellValue;
  dependencies: string[];
  tableReferences: string[];
}

export interface ExpressionContext {
  currentRow: TableRow;
  allRows: TableRow[];
  tables: Map<string, any>;
  currentColumn: TableColumn;
  computedValues: Map<string, TableCellValue>;
}

export interface TableConfig {
  id?: string;
  name: string;
  description?: string;
  realEscope: boolean;
  rows: TableRow[];
  columns: TableColumn[];
  trackHistory?: boolean;
  allowDynamicColumns?: boolean;
  callbacks?: TableCallbacks;
  validations?: Record<string, ColumnValidation>;
  metadata?: Record<string, unknown>;
}

export interface ITable {
  id: string;
  name: string;
  realEscope: boolean;
  getRows(): TableRow[];
  getColumns(): TableColumn[];
  getSnapshots(): TableSnapshot[];
  getHistory(): TableHistoryEntry[];
  create(row: Omit<TableRow, 'id'>): Promise<string>;
  update(rowId: string | number, changes: Partial<TableRow>): Promise<void>;
  delete(rowId: string | number): Promise<void>;
  addDynamicColumn(column: TableColumn): Promise<void>;
  updateColumn(columnId: string, updates: Partial<TableColumn>): Promise<void>;
  deleteColumn(columnId: string): Promise<void>;
  renameColumn(columnId: string, newAlias: string): Promise<void>;
  applyFilter(filter: TableFilter): void;
  clearFilter(filterId?: string): void;
  applySort(sort: TableSort[]): void;
  computeDynamicColumns(): void;
  getValue(rowId: string | number, columnId: string): TableCellValue | undefined;
  createSnapshot(): TableSnapshot;
  restoreSnapshot(snapshot: TableSnapshot): void;
  getSnapshot(): TableSnapshot;
  hydrate(snapshot: TableSnapshot): void;
  destroy(): void;
}

export type Table = ITable;
