/**
 * Configurações Padrão do Table Render
 * Define valores default para todas as funcionalidades padrão
 */

import type { TableColumn, TableFilter, TableSort } from './types';

/**
 * Configurações padrão para qualquer coluna
 * Garante que filtro, reordenação e ordenação estejam habilitadas por padrão
 */
export const DEFAULT_COLUMN_CONFIG = {
  /** Todos podem filtrar por qualquer coluna por padrão */
  isFilterable: true,

  /** Todos podem ordenar por qualquer coluna por padrão */
  isSortable: true,

  /** Nenhuma coluna é oculta por padrão */
  isHidden: false,

  /** Nenhuma coluna é read-only por padrão */
  isReadOnly: false,
} as const;

/**
 * Operadores de filtro suportados com descrição
 */
export const FILTER_OPERATORS = {
  eq: { label: 'Igual', symbol: '=' },
  ne: { label: 'Não igual', symbol: '≠' },
  gt: { label: 'Maior que', symbol: '>' },
  gte: { label: 'Maior ou igual', symbol: '≥' },
  lt: { label: 'Menor que', symbol: '<' },
  lte: { label: 'Menor ou igual', symbol: '≤' },
  contains: { label: 'Contém', symbol: '∋' },
  in: { label: 'Em', symbol: '∈' },
  between: { label: 'Entre', symbol: '↔' },
} as const;

/**
 * Tipos de dados suportados com informações
 */
export const DATA_TYPES = {
  string: {
    label: 'Texto',
    operators: ['eq', 'ne', 'contains'],
    defaultWidth: 200,
  },
  number: {
    label: 'Número',
    operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between'],
    defaultWidth: 120,
  },
  boolean: {
    label: 'Booleano',
    operators: ['eq', 'ne'],
    defaultWidth: 100,
  },
  date: {
    label: 'Data',
    operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between'],
    defaultWidth: 140,
  },
  currency: {
    label: 'Moeda',
    operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between'],
    defaultWidth: 130,
  },
  custom: {
    label: 'Customizado',
    operators: ['eq', 'ne', 'contains'],
    defaultWidth: 200,
  },
} as const;

/**
 * Aplica defaults a uma coluna, mantendo overrides fornecidos
 */
export function applyColumnDefaults(column: TableColumn): TableColumn {
  return {
    ...DEFAULT_COLUMN_CONFIG,
    ...column,
  } as TableColumn;
}

/**
 * Estados padrão para qualquer tabela
 */
export const DEFAULT_TABLE_STATE = {
  filters: [] as TableFilter[],
  sorts: [] as TableSort[],
  trackHistory: true,
  allowDynamicColumns: true,
} as const;
