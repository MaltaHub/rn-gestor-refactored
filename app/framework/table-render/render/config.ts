import type { Table, TableCellValue } from '../types';
import type { TableColumn } from '../types';
import type {
  RenderTableConfig,
  RenderTableConfigOverrides,
  RenderTableLabels,
  RenderTableMode,
  RenderTablePermissions,
  RenderTableFormatValueParams,
} from './types';

const defaultLabels: RenderTableLabels = {
  dynamicColumnBadge: 'dinamico',
  addColumnAfter: (label) => `Adicionar coluna apos ${label}`,
  addRowAbove: (rowId) => `Adicionar linha acima de ${rowId}`,
  addRowTitle: 'Adicionar linha',
  sortAsc: 'Ordenar A->Z',
  sortDesc: 'Ordenar Z->A',
  filter: 'Filtrar',
  filterActive: 'Ativo',
  clearFilter: 'Limpar filtro',
  addColumn: 'Adicionar coluna',
  newColumnName: 'Nova coluna',
  removeColumn: 'Remover coluna',
  renameColumn: 'Renomear coluna',
  editRow: 'Editar linha',
  deleteRow: 'Excluir linha',
  duplicateRow: 'Duplicar linha',
  hideColumn: 'Ocultar coluna',
  hiddenColumnsTitle: 'Colunas ocultas',
  showColumn: 'Mostrar coluna',
  filterDialogTitle: (label) => `Filtrar: ${label}`,
  filterPlaceholder: 'Digite para filtrar...',
  apply: 'Aplicar',
  cancel: 'Cancelar',
  editRowTitle: 'Editar Linha',
  save: 'Salvar',
  emptyCell: '-',
  emptyState: 'Nenhum dado encontrado.',
  promptRenameColumn: (label) => `Novo nome para "${label}":`,
  confirmRemoveColumn: (label) => `Remover a coluna "${label}"?`,
  confirmDeleteRow: (rowId) => `Excluir a linha ${rowId}?`,
  alertMinColumns: 'A tabela precisa ter pelo menos uma coluna.',
  alertMinRows: 'A tabela precisa manter ao menos uma linha.',
  alertReadOnly: 'Esta tabela nao permite operacoes de dados.',
  alertNoColumns: 'Adicione ao menos uma coluna antes de criar linhas.',
};

const defaultInteractions = {
  alert: (message: string) => {
    if (typeof window !== 'undefined') {
      window.alert(message);
      return;
    }
    console.warn(message);
  },
  confirm: (message: string) => {
    if (typeof window !== 'undefined') {
      return window.confirm(message);
    }
    return false;
  },
  prompt: (message: string, defaultValue?: string) => {
    if (typeof window !== 'undefined') {
      return window.prompt(message, defaultValue);
    }
    return null;
  },
};

const defaultFilter = {
  operator: 'contains' as const,
  caseSensitive: false,
};

const defaultColumnIdFactory = (base: string, existing: Set<string>): string => {
  const normalized = base
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (!normalized.length) {
    return `col_${Date.now()}`;
  }

  if (!existing.has(normalized)) {
    return normalized;
  }

  let counter = 1;
  let candidate = `${normalized}_${counter}`;
  while (existing.has(candidate)) {
    counter += 1;
    candidate = `${normalized}_${counter}`;
  }
  return candidate;
};

const defaultBuildEmptyRow = (columns: TableColumn[]) =>
  columns.reduce<Record<string, TableCellValue>>((acc, column) => {
    if (!column.isDynamic) {
      acc[column.dataSource] = '';
    }
    return acc;
  }, {});

const createDefaultFormatValue = (labels: RenderTableLabels) => {
  return ({ value, column }: RenderTableFormatValueParams) => {
    if (value === null || value === undefined || value === '') {
      return labels.emptyCell;
    }
    if (column.dataType === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    if (column.dataType === 'number' && typeof value === 'number') {
      return value.toLocaleString('pt-BR');
    }
    return value;
  };
};

export const resolveRenderConfig = (overrides?: RenderTableConfigOverrides): RenderTableConfig => {
  const labels = { ...defaultLabels, ...(overrides?.labels ?? {}) };
  const interactions = { ...defaultInteractions, ...(overrides?.interactions ?? {}) };
  const filter = { ...defaultFilter, ...(overrides?.filter ?? {}) };
  const formatValue = overrides?.formatValue ?? createDefaultFormatValue(labels);

  return {
    labels,
    interactions,
    formatValue,
    filter,
    columnIdFactory: overrides?.columnIdFactory ?? defaultColumnIdFactory,
    buildEmptyRow: overrides?.buildEmptyRow ?? defaultBuildEmptyRow,
    permissionsResolver: overrides?.permissionsResolver,
    onError: overrides?.onError,
    onColumnOrderChange: overrides?.onColumnOrderChange,
  };
};

export const resolveRenderPermissions = (
  table: Table,
  mode: RenderTableMode,
  config: RenderTableConfig
): RenderTablePermissions => {
  const base: RenderTablePermissions = {
    isReadOnly: mode === 'read-only',
    canStructureEdit: mode === 'edit',
    canEditHeaders: mode !== 'read-only',
    allowColumnReorder: mode === 'edit',
    canEditRows: mode !== 'read-only' && table.realEscope,
  };

  if (!config.permissionsResolver) {
    return base;
  }

  return {
    ...base,
    ...config.permissionsResolver(table, mode),
  };
};
