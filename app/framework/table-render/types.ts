/**
 * Table Render Types
 * Define toda a tipagem para o sistema de tabelas com suporte a:
 * - Tabelas reais (realEscope: true) com operações CRUD
 * - Tabelas imaginárias (realEscope: false) com colunas dinâmicas
 */

/**
 * Representa uma coluna real ou dinâmica em uma tabela
 */
export interface TableColumn {
  /** Identificador único da coluna */
  id: string;

  /** Apelido/label da coluna. Se vazio, usa dataSource */
  alias?: string;

  /** Fonte dos dados (nome da coluna no banco ou índice no objeto) */
  dataSource: string;

  /** Tipo de dado armazenado nesta coluna */
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'currency' | 'custom';

  /** Se true, é uma coluna dinâmica (calculada por expressão) */
  isDynamic: boolean;

  /** Expressão para calcular o valor (apenas para isDynamic: true) */
  expression?: string;

  /** Se verdadeiro, esta coluna não pode ser editada (aplica-se a ambas reais e dinâmicas) */
  isReadOnly?: boolean;

  /** Ordem de exibição na tabela */
  order: number;

  /** Se verdadeiro, coluna está oculta na exibição */
  isHidden?: boolean;

  /** Se verdadeiro, coluna pode ser usada em filtros */
  isFilterable?: boolean;

  /** Se verdadeiro, coluna pode ser usada em ordenação */
  isSortable?: boolean;

  /** Largura da coluna (em pixels ou %) */
  width?: string;
}

/**
 * Representa uma linha de dados na tabela
 */
export interface TableRow {
  /** ID único da linha */
  id: string | number;

  /** Dados da linha como objeto key-value */
  [key: string]: any;
}

/**
 * Filtro que pode ser aplicado à tabela
 */
export interface TableFilter {
  /** Identificador do filtro */
  id: string;

  /** Coluna a ser filtrada */
  columnId: string;

  /** Operador de comparação */
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';

  /** Valor(es) para comparação */
  value: any;

  /** Se verdadeiro, filtro é case-insensitive */
  caseSensitive?: boolean;
}

/**
 * Ordenação que pode ser aplicada à tabela
 */
export interface TableSort {
  /** Coluna a ser ordenada */
  columnId: string;

  /** Direção da ordenação */
  direction: 'asc' | 'desc';
}

/**
 * Callbacks para operações reais no banco de dados
 * Apenas usado quando realEscope: true
 */
export interface TableCallbacks {
  /** Chamado ao criar nova linha */
  onCreate?: (row: TableRow) => Promise<void>;

  /** Chamado ao atualizar linha */
  onUpdate?: (rowId: string | number, changes: Partial<TableRow>) => Promise<void>;

  /** Chamado ao deletar linha */
  onDelete?: (rowId: string | number) => Promise<void>;

  /** Chamado ao renomear coluna */
  onRenameColumn?: (columnId: string, newAlias: string) => Promise<void>;

  /** Chamado ao deletar coluna */
  onDeleteColumn?: (columnId: string) => Promise<void>;

  /** Chamado ao adicionar coluna dinâmica */
  onAddDynamicColumn?: (column: TableColumn) => Promise<void>;
}

/**
 * Validação de um valor para uma coluna específica
 */
export interface ColumnValidation {
  /** Validadores customizados */
  validators?: Array<(value: any) => boolean | string>;

  /** Valor máximo (para numbers/currency) */
  max?: number;

  /** Valor mínimo (para numbers/currency) */
  min?: number;

  /** Comprimento máximo (para strings) */
  maxLength?: number;

  /** Comprimento mínimo (para strings) */
  minLength?: number;

  /** Se verdadeiro, campo é obrigatório */
  required?: boolean;

  /** Pattern regex para validação */
  pattern?: RegExp;
}

/**
 * Metadados de uma coluna dinâmica com informações de compilação
 */
export interface CompiledExpression {
  /** Expressão original */
  originalExpression: string;

  /** Função compilada que calcula o valor */
  compute: (row: TableRow, tables: Map<string, Table>, allRows?: TableRow[]) => any;

  /** Colunas referenciadas por esta expressão (para invalidação de cache) */
  dependencies: string[];

  /** Tabelas referenciadas por esta expressão */
  tableReferences: string[];
}

/**
 * Snapshot do estado de uma tabela em um momento específico
 */
export interface TableSnapshot {
  /** ID da tabela */
  tableId: string;

  /** Timestamp do snapshot */
  timestamp: number;

  /** Linhas neste snapshot */
  rows: TableRow[];

  /** Filtros aplicados */
  filters: TableFilter[];

  /** Ordenação aplicada */
  sorts: TableSort[];

  /** Colunas (configuração) */
  columns: TableColumn[];

  /** Hash do conteúdo para detectar mudanças */
  contentHash: string;
}

/**
 * Histórico de mudanças em uma tabela
 */
export interface TableHistoryEntry {
  /** Tipo de operação */
  operation: 'create' | 'update' | 'delete' | 'filter' | 'sort' | 'column_add' | 'column_delete' | 'column_rename';

  /** Timestamp da operação */
  timestamp: number;

  /** ID da linha afetada (se aplicável) */
  rowId?: string | number;

  /** ID da coluna afetada (se aplicável) */
  columnId?: string;

  /** Dados antes da mudança */
  oldValue?: any;

  /** Dados depois da mudança */
  newValue?: any;

  /** Usuário que realizou a operação (opcional) */
  userId?: string;

  /** Descrição textual da operação */
  description: string;
}

/**
 * Configuração inicial de uma tabela
 */
export interface TableConfig {
  /** ID único da tabela (automático se não fornecido) */
  id?: string;

  /** Nome legível da tabela */
  name: string;

  /** Descrição da tabela */
  description?: string;

  /** Se true, tabela pode modificar o banco de dados (CRUD real) */
  realEscope: boolean;

  /** Dados iniciais da tabela */
  rows: TableRow[];

  /** Configuração de colunas */
  columns: TableColumn[];

  /** Se true, historiza todas as mudanças */
  trackHistory?: boolean;

  /** Se true, permite colunas dinâmicas */
  allowDynamicColumns?: boolean;

  /** Callbacks para operações reais (apenas se realEscope: true) */
  callbacks?: TableCallbacks;

  /** Validações por coluna */
  validations?: Record<string, ColumnValidation>;

  /** Metadados customizados */
  metadata?: Record<string, any>;
}

/**
 * Interface pública de uma tabela (usado por consumidores)
 */
export interface ITable {
  // Informações
  id: string;
  name: string;
  realEscope: boolean;

  // Dados
  getRows(): TableRow[];
  getColumns(): TableColumn[];
  getSnapshots(): TableSnapshot[];
  getHistory(): TableHistoryEntry[];

  // Operações CRUD (apenas realEscope: true)
  create(row: Omit<TableRow, 'id'>): Promise<string>;
  update(rowId: string | number, changes: Partial<TableRow>): Promise<void>;
  delete(rowId: string | number): Promise<void>;

  // Operações em colunas
  addDynamicColumn(column: TableColumn): Promise<void>;
  updateColumn(columnId: string, updates: Partial<TableColumn>): Promise<void>;
  deleteColumn(columnId: string): Promise<void>;
  renameColumn(columnId: string, newAlias: string): Promise<void>;

  // Filtros e ordenação
  applyFilter(filter: TableFilter): void;
  clearFilter(filterId?: string): void;
  applySort(sort: TableSort[]): void;

  // Computação de colunas dinâmicas
  computeDynamicColumns(): void;
  getValue(rowId: string | number, columnId: string): any;

  // Snapshots e histórico
  createSnapshot(): TableSnapshot;
  restoreSnapshot(snapshot: TableSnapshot): void;

  // Sincronização
  getSnapshot(): TableSnapshot;
  hydrate(snapshot: TableSnapshot): void;

  // Limpeza
  destroy(): void;
}

/**
 * Classe Table (implementação)
 */
export interface Table extends ITable {}

/**
 * Contexto de execução para expressões dinâmicas
 */
export interface ExpressionContext {
  /** Linha atual */
  currentRow: TableRow;

  /** Todas as linhas da tabela */
  allRows: TableRow[];

  /** Mapa de tabelas disponíveis para lookup */
  tables: Map<string, Table>;

  /** Coluna que está sendo calculada */
  currentColumn: TableColumn;

  /** Valores previamente calculados (para expressões dependentes) */
  computedValues: Map<string, any>;
}
