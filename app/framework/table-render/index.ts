/**
 * Table Render - Main Exports
 * Exporta toda a API pública do Table Render
 * 
 * 🎯 FUNCIONALIDADES PADRÃO (sempre habilitadas):
 * ✓ Filtros em todas as colunas
 * ✓ Reordenação de colunas
 * ✓ Ordenação em todas as colunas
 */

// Tipos
export type {
  TableColumn,
  TableRow,
  TableFilter,
  TableSort,
  TableSnapshot,
  TableHistoryEntry,
  TableCallbacks,
  TableConfig,
  ITable,
  CompiledExpression,
  ExpressionContext,
  ColumnValidation,
} from './types';

// Classes
export { Table } from './Table';

// Registry
export { TableRegistry, tableRegistry, registerTable, getTable, getTableByName, removeTable } from './registry';
export type { TableId } from './registry';

// Expression Engine
export { ExpressionEngine, expressionEngine } from './expression-engine';

// Configurações padrão e utilitários
export {
  DEFAULT_COLUMN_CONFIG,
  DEFAULT_TABLE_STATE,
  FILTER_OPERATORS,
  DATA_TYPES,
  applyColumnDefaults,
} from './defaults';

// Stores (para poder estender se necessário)
export type {
  DataStoreState,
  FilterStoreState,
  SortStoreState,
  HistoryStoreState,
  SnapshotStoreState,
  DynamicColumnStoreState,
} from './stores';
export {
  createDataStore,
  createFilterStore,
  createSortStore,
  createHistoryStore,
  createSnapshotStore,
  createDynamicColumnStore,
} from './stores';

// Hooks e utilidades
export { useTable, useTableManager } from './useTableFramework';

// Renderizacao
export { RenderTable } from './render/RenderTable';
export { resolveRenderConfig, resolveRenderPermissions } from './render/config';
export type {
  RenderTableMode,
  RenderTableConfig,
  RenderTableConfigOverrides,
  RenderTableLabels,
  RenderTableInteractions,
  RenderTablePermissions,
  RenderTableProps,
  NavigateConfig,
  DataItem,
} from './render/types';

/**
 * Re-export de tipos mais comuns para conveniência
 */
export type {
  TableColumn as Column,
  TableRow as Row,
  TableConfig as Config,
} from './types';
