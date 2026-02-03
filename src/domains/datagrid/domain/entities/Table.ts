/**
 * Classe Table - Core do Table Render
 * 
 * Instância de uma tabela no sistema com suporte COMPLETO a:
 * 
 * 🔹 FUNCIONALIDADES PADRÃO:
 *    ✓ Filtros (sempre habilitados em todas as colunas por padrão)
 *    ✓ Reordenação de colunas (sempre habilitada)
 *    ✓ Ordenação de linhas (sempre habilitada em todas as colunas por padrão)
 * 
 * 🔹 RECURSOS ADICIONAIS:
 *    • CRUD com callbacks (apenas se realEscope: true)
 *    • Colunas dinâmicas com expressões
 *    • Histórico e snapshots
 *    • Persistência de estado
 *    • Validações por coluna
 * 
 * @example
 * const table = new Table({
 *   name: 'Produtos',
 *   realEscope: true,
 *   rows: [...],
 *   columns: [
 *     {
 *       id: 'nome',
 *       dataSource: 'nome',
 *       dataType: 'string',
 *       isDynamic: false,
 *       order: 0,
 *       // Filtro, reordenação e ordenação JÁ HABILITADOS por padrão!
 *     }
 *   ]
 * });
 * 
 * // Usar funcionalidades padrão:
 * table.applyFilter({ columnId: 'nome', operator: 'contains', value: 'A' });
 * table.applySort([{ columnId: 'nome', direction: 'asc' }]);
 * table.setColumnOrder(['preco', 'nome', 'estoque']);
 */

import crypto from 'crypto';
import {
  ITable,
  TableConfig,
  TableRow,
  TableColumn,
  TableFilter,
  TableSort,
  TableSnapshot,
  TableHistoryEntry,
  ColumnValidation,
  TableCellValue,
} from '@/src/domains/shared/domain/types';
import {
  createDataStore,
  createFilterStore,
  createSortStore,
  createHistoryStore,
  createSnapshotStore,
  createDynamicColumnStore,
} from '@/app/framework/table-render/stores';
import { expressionEngine } from '@/app/framework/table-render/expression-engine';
import { applyColumnDefaults } from '@/app/framework/table-render/defaults';

/**
 * Implementação da classe Table
 */
export class Table implements ITable {
  // Informações básicas
  readonly id: string;
  readonly name: string;
  readonly realEscope: boolean;
  readonly description: string;
  readonly allowDynamicColumns: boolean;
  readonly trackHistory: boolean;

  // Callbacks para operações reais
  private callbacks: {
    onCreate?: (row: TableRow) => Promise<void>;
    onUpdate?: (rowId: string | number, changes: Partial<TableRow>) => Promise<void>;
    onDelete?: (rowId: string | number) => Promise<void>;
    onRenameColumn?: (columnId: string, newAlias: string) => Promise<void>;
    onDeleteColumn?: (columnId: string) => Promise<void>;
    onAddDynamicColumn?: (column: TableColumn) => Promise<void>;
  };

  // Validações por coluna
  private validations: Map<string, ColumnValidation>;

  // Metadados customizados
  private metadata: Map<string, unknown>;

  // Stores Zustand (estado interno)
  private dataStore: ReturnType<typeof createDataStore>;
  private filterStore: ReturnType<typeof createFilterStore>;
  private sortStore: ReturnType<typeof createSortStore>;
  private historyStore: ReturnType<typeof createHistoryStore>;
  private snapshotStore: ReturnType<typeof createSnapshotStore>;
  private dynamicColumnStore: ReturnType<typeof createDynamicColumnStore>;

  // Cache de colunas dinâmicas processadas
  private dynamicColumnCache: Map<string, TableCellValue> = new Map();

  /**
   * Construtor
   * 
   * Aplica automaticamente os defaults para garantir que:
   * ✓ Todas as colunas são filtráveis por padrão
   * ✓ Todas as colunas são ordenáveis por padrão  
   * ✓ Reordenação está sempre habilitada
   * ✓ Histórico e snapshots estão ativados
   */
  constructor(config: TableConfig) {
    this.id = config.id || this.generateId();
    this.name = config.name;
    this.realEscope = config.realEscope;
    this.description = config.description || '';
    this.allowDynamicColumns = config.allowDynamicColumns !== false;
    this.trackHistory = config.trackHistory !== false;

    this.callbacks = config.callbacks || {};
    this.validations = new Map(Object.entries(config.validations || {}));
    this.metadata = new Map(Object.entries(config.metadata || {}));

    // APLICAR DEFAULTS: Garantir que filtro, reordenação e ordenação estão habilitados
    const columnsWithDefaults = config.columns.map((col) => applyColumnDefaults(col));

    // Inicializar stores com colunas com defaults aplicados
    this.dataStore = createDataStore(config.rows, columnsWithDefaults);
    this.filterStore = createFilterStore();
    this.sortStore = createSortStore();
    this.historyStore = createHistoryStore();
    this.snapshotStore = createSnapshotStore();
    this.dynamicColumnStore = createDynamicColumnStore();

    console.log(
      `[Table] Criada tabela: "${this.name}" (ID: ${this.id}, realEscope: ${this.realEscope}, Filtro/Reord/Ord: ✓)`
    );
  }

  /**
   * Gera ID único para a tabela
   */
  private generateId(): string {
    return `tbl_${crypto.randomBytes(6).toString('hex')}`;
  }

  /**
   * Obtém todas as linhas
   */
  getRows(): TableRow[] {
    const state = this.dataStore.getState();
    return [...state.rows];
  }

  /**
   * Obtém todas as colunas
   */
  getColumns(): TableColumn[] {
    const state = this.dataStore.getState();
    return [...state.columns];
  }

  /**
   * Obtém snapshots armazenados
   */
  getSnapshots(): TableSnapshot[] {
    const state = this.snapshotStore.getState();
    return [...state.snapshots];
  }

  /**
   * Obtém histórico de mudanças
   */
  getHistory(): TableHistoryEntry[] {
    const state = this.historyStore.getState();
    return [...state.entries];
  }

  /**
   * Cria uma nova linha (apenas realEscope: true)
   * @throws Se realEscope for false ou se validação falhar
   */
  async create(row: Omit<TableRow, 'id'>): Promise<string> {
    if (!this.realEscope) {
      throw new Error(
        `Não é possível criar linhas em tabelas imaginárias. Tabela "${this.name}" não permite operações reais.`
      );
    }

    // Gerar ID único
    const newRow: TableRow = {
      ...row,
      id: `row_${crypto.randomBytes(6).toString('hex')}`,
    };

    // Validar
    this.validateRow(newRow);

    // Adicionar ao store
    this.dataStore.getState().addRow(newRow);

    // Chamar callback se registrado
    if (this.callbacks.onCreate) {
      try {
        await this.callbacks.onCreate(newRow);
      } catch (error) {
        // Remover do store se callback falhar
        this.dataStore.getState().deleteRow(newRow.id);
        throw error;
      }
    }

    // Registrar no histórico
    if (this.trackHistory) {
      this.historyStore.getState().addEntry({
        operation: 'create',
        timestamp: Date.now(),
        rowId: newRow.id,
        newValue: newRow,
        description: `Linha criada: ${newRow.id}`,
      });
    }

    // Invalidar cache de colunas dinâmicas
    this.invalidateDynamicColumnCache();

    console.log(`[Table] Linha criada: "${newRow.id}" em tabela "${this.name}"`);
    return String(newRow.id);
  }

  /**
   * Atualiza uma linha (apenas realEscope: true)
   * @throws Se realEscope for false, linha não existir, ou validação falhar
   */
  async update(rowId: string | number, changes: Partial<TableRow>): Promise<void> {
    if (!this.realEscope) {
      throw new Error(
        `Não é possível atualizar linhas em tabelas imaginárias. Tabela "${this.name}" não permite operações reais.`
      );
    }

    const oldRow = this.dataStore.getState().getRow(rowId);
    if (!oldRow) {
      throw new Error(`Linha não encontrada: ${rowId}`);
    }

    const newRow = { ...oldRow, ...changes };

    // Validar
    this.validateRow(newRow);

    // Atualizar no store
    this.dataStore.getState().updateRow(rowId, changes);

    // Chamar callback se registrado
    if (this.callbacks.onUpdate) {
      try {
        await this.callbacks.onUpdate(rowId, changes);
      } catch (error) {
        // Reverter se callback falhar
        this.dataStore.getState().updateRow(rowId, oldRow);
        throw error;
      }
    }

    // Registrar no histórico
    if (this.trackHistory) {
      this.historyStore.getState().addEntry({
        operation: 'update',
        timestamp: Date.now(),
        rowId,
        oldValue: oldRow,
        newValue: newRow,
        description: `Linha atualizada: ${rowId}`,
      });
    }

    // Invalidar cache
    this.invalidateDynamicColumnCache();

    console.log(`[Table] Linha atualizada: "${rowId}" em tabela "${this.name}"`);
  }

  /**
   * Deleta uma linha (apenas realEscope: true)
   * @throws Se realEscope for false ou linha não existir
   */
  async delete(rowId: string | number): Promise<void> {
    if (!this.realEscope) {
      throw new Error(
        `Não é possível deletar linhas em tabelas imaginárias. Tabela "${this.name}" não permite operações reais.`
      );
    }

    const oldRow = this.dataStore.getState().getRow(rowId);
    if (!oldRow) {
      throw new Error(`Linha não encontrada: ${rowId}`);
    }

    // Chamar callback se registrado
    if (this.callbacks.onDelete) {
      try {
        await this.callbacks.onDelete(rowId);
      } catch (error) {
        throw error;
      }
    }

    // Remover do store
    this.dataStore.getState().deleteRow(rowId);

    // Registrar no histórico
    if (this.trackHistory) {
      this.historyStore.getState().addEntry({
        operation: 'delete',
        timestamp: Date.now(),
        rowId,
        oldValue: oldRow,
        description: `Linha deletada: ${rowId}`,
      });
    }

    // Invalidar cache
    this.invalidateDynamicColumnCache();

    console.log(`[Table] Linha deletada: "${rowId}" em tabela "${this.name}"`);
  }

  /**
   * Adiciona uma coluna dinâmica (apenas realEscope: false ou se allowDynamicColumns: true)
   */
  async addColumn(column: TableColumn, options?: { fillValue?: TableCellValue }): Promise<void> {
    if (column.isDynamic) {
      await this.addDynamicColumn(column);
      return;
    }

    const existing = this.dataStore.getState().getColumn(column.id);
    if (existing) {
      throw new Error(`Já existe uma coluna com id "${column.id}"`);
    }

    const rowsWithValue = this.dataStore.getState().rows.map((row) => ({
      ...row,
      [column.dataSource]: options?.fillValue ?? '',
    }));

    this.dataStore.getState().addColumn(column);
    this.dataStore.getState().setRows(rowsWithValue);

    if (this.trackHistory) {
      this.historyStore.getState().addEntry({
        operation: 'column_add',
        timestamp: Date.now(),
        columnId: column.id,
        newValue: column,
        description: `Coluna adicionada: ${column.alias || column.dataSource}`,
      });
    }

    console.log(`[Table] Coluna adicionada: "${column.id}" em tabela "${this.name}"`);
  }

  /**
   * Adiciona uma coluna dinâmica (apenas realEscope: false ou se allowDynamicColumns: true)
   */
  async addDynamicColumn(column: TableColumn): Promise<void> {
    if (!column.isDynamic) {
      throw new Error('Esta função é apenas para colunas dinâmicas. Use updateColumn para colunas reais.');
    }

    if (!this.allowDynamicColumns) {
      throw new Error(`Tabela "${this.name}" não permite colunas dinâmicas`);
    }

    if (!column.expression) {
      throw new Error('Coluna dinâmica deve ter expressão definida');
    }

    // Compilar expressão
    try {
      const compiled = expressionEngine.compile(column.expression);
      this.dynamicColumnStore.getState().setCompiledExpression(column.id, compiled);
    } catch (error) {
      throw new Error(`Erro ao compilar expressão para coluna "${column.id}": ${error}`);
    }

    // Adicionar coluna
    this.dataStore.getState().addColumn(column);

    // Chamar callback se registrado
    if (this.callbacks.onAddDynamicColumn) {
      try {
        await this.callbacks.onAddDynamicColumn(column);
      } catch (error) {
        this.dataStore.getState().deleteColumn(column.id);
        this.dynamicColumnStore.getState().clearCompiledExpressions();
        throw error;
      }
    }

    // Registrar no histórico
    if (this.trackHistory) {
      this.historyStore.getState().addEntry({
        operation: 'column_add',
        timestamp: Date.now(),
        columnId: column.id,
        newValue: column,
        description: `Coluna dinâmica adicionada: ${column.alias || column.dataSource}`,
      });
    }

    console.log(`[Table] Coluna dinâmica adicionada: "${column.id}" em tabela "${this.name}"`);
  }

  /**
   * Atualiza uma coluna (metadados, alias, etc)
   */
  async updateColumn(columnId: string, updates: Partial<TableColumn>): Promise<void> {
    const oldColumn = this.dataStore.getState().getColumn(columnId);
    if (!oldColumn) {
      throw new Error(`Coluna não encontrada: ${columnId}`);
    }

    // Se mudou a expressão, recompilá-la
    if (updates.expression && updates.expression !== oldColumn.expression) {
      if (!oldColumn.isDynamic) {
        throw new Error(`Coluna "${columnId}" não é dinâmica. Não pode adicionar expressão.`);
      }

      try {
        const compiled = expressionEngine.compile(updates.expression);
        this.dynamicColumnStore.getState().setCompiledExpression(columnId, compiled);
      } catch (error) {
        throw new Error(`Erro ao compilar nova expressão: ${error}`);
      }
    }

    // Atualizar coluna
    this.dataStore.getState().updateColumn(columnId, updates);

    // Registrar no histórico
    if (this.trackHistory) {
      this.historyStore.getState().addEntry({
        operation: 'column_add',
        timestamp: Date.now(),
        columnId,
        oldValue: oldColumn,
        newValue: { ...oldColumn, ...updates },
        description: `Coluna atualizada: ${columnId}`,
      });
    }

    // Invalidar cache se mudou expressão
    if (updates.expression) {
      this.invalidateDynamicColumnCache();
    }
  }

  /**
   * Deleta uma coluna
   */
  async deleteColumn(columnId: string): Promise<void> {
    const column = this.dataStore.getState().getColumn(columnId);
    if (!column) {
      throw new Error(`Coluna não encontrada: ${columnId}`);
    }

    // Chamar callback se registrado
    if (this.callbacks.onDeleteColumn) {
      try {
        await this.callbacks.onDeleteColumn(columnId);
      } catch (error) {
        throw error;
      }
    }

    // Remover do store
    this.dataStore.getState().deleteColumn(columnId);

    // Limpar valores desta coluna das linhas existentes
    const updatedRows = this.dataStore.getState().rows.map((row) => {
      const { [column.dataSource]: _removed, ...rest } = row;
      void _removed;
      return { id: row.id, ...rest } as TableRow;
    });
    this.dataStore.getState().setRows(updatedRows);

    // Remover expressão compilada se dinâmica
    if (column.isDynamic) {
      this.dynamicColumnStore.getState().clearCompiledExpressions();
    }

    // Registrar no histórico
    if (this.trackHistory) {
      this.historyStore.getState().addEntry({
        operation: 'column_delete',
        timestamp: Date.now(),
        columnId,
        oldValue: column,
        description: `Coluna deletada: ${columnId}`,
      });
    }

    console.log(`[Table] Coluna deletada: "${columnId}" em tabela "${this.name}"`);
  }

  /**
   * Renomeia uma coluna (atualiza alias)
   */
  async renameColumn(columnId: string, newAlias: string): Promise<void> {
    const column = this.dataStore.getState().getColumn(columnId);
    if (!column) {
      throw new Error(`Coluna não encontrada: ${columnId}`);
    }

    const oldAlias = column.alias;

    // Chamar callback se registrado
    if (this.callbacks.onRenameColumn) {
      try {
        await this.callbacks.onRenameColumn(columnId, newAlias);
      } catch (error) {
        throw error;
      }
    }

    // Atualizar
    this.dataStore.getState().updateColumn(columnId, { alias: newAlias });

    // Registrar no histórico
    if (this.trackHistory) {
      this.historyStore.getState().addEntry({
        operation: 'column_rename',
        timestamp: Date.now(),
        columnId,
        oldValue: oldAlias,
        newValue: newAlias,
        description: `Coluna renomeada: "${oldAlias || column.dataSource}" -> "${newAlias}"`,
      });
    }

    console.log(`[Table] Coluna renomeada: "${columnId}" de "${oldAlias}" para "${newAlias}"`);
  }

  /**
   * FUNCIONALIDADE PADRÃO: Reordena colunas com base em uma lista de IDs
   * 
   * Esta funcionalidade é SEMPRE habilitada em todas as tabelas.
   * 
   * @param columnOrder - Array com IDs das colunas em nova ordem
   * @example
   * table.setColumnOrder(['preco', 'nome', 'estoque']);
   */
  setColumnOrder(columnOrder: string[]): void {
    const orderMap = new Map(columnOrder.map((id, index) => [id, index]));
    const columns = this.dataStore.getState().columns.map((column) => {
      const newOrder = orderMap.get(column.id);
      return newOrder !== undefined ? { ...column, order: newOrder } : column;
    });

    const orderedColumns = [...columns].sort((a, b) => a.order - b.order);
    this.dataStore.getState().setColumns(orderedColumns);
  }

  /**
   * FUNCIONALIDADE PADRÃO: Aplica filtro à tabela
   * 
   * Esta funcionalidade é SEMPRE habilitada em todas as colunas por padrão.
   * Cada coluna tem isFilterable: true automaticamente aplicado no construtor.
   * 
   * @param filter - Configuração do filtro
   * @example
   * table.applyFilter({
   *   id: 'filter_1',
   *   columnId: 'status',
   *   operator: 'eq',
   *   value: 'ativo'
   * });
   */
  applyFilter(filter: TableFilter): void {
    this.filterStore.getState().addFilter(filter);
    this.applyFiltersAndSorts();
  }

  /**
   * FUNCIONALIDADE PADRÃO: Remove filtro
   * 
   * @param filterId - ID do filtro a remover. Se não fornecido, remove TODOS os filtros.
   */
  clearFilter(filterId?: string): void {
    if (filterId) {
      this.filterStore.getState().removeFilter(filterId);
    } else {
      this.filterStore.getState().clearFilters();
    }
    this.applyFiltersAndSorts();
  }

  /**
   * FUNCIONALIDADE PADRÃO: Aplica ordenação à tabela
   * 
   * Esta funcionalidade é SEMPRE habilitada em todas as colunas por padrão.
   * Cada coluna tem isSortable: true automaticamente aplicado no construtor.
   * 
   * @param sorts - Array com configurações de ordenação
   * @example
   * table.applySort([{ columnId: 'preco', direction: 'desc' }]);
   */
  applySort(sorts: TableSort[]): void {
    this.sortStore.getState().setSorts(sorts);
    this.applyFiltersAndSorts();
  }

  /**
   * Aplica filtros e ordenação e calcula linhas visíveis
   */
  private applyFiltersAndSorts(): void {
    const state = this.dataStore.getState();
    const filterState = this.filterStore.getState();
    const sortState = this.sortStore.getState();

    let filtered = [...state.rows];

    // Aplicar filtros
    for (const filter of filterState.filters) {
      filtered = this.applyRowFilter(filtered, filter);
    }

    // Aplicar ordenação
    let sorted = [...filtered];
    for (const sort of sortState.sorts) {
      sorted = this.applySortToRows(sorted, sort);
    }

    // Atualizar store
    this.dataStore.setState({ filteredRows: filtered, sortedRows: sorted });
  }

  /**
   * Filtra um conjunto de linhas por um filtro
   */
  private toComparableValue(value: TableCellValue): string | number {
    if (typeof value === 'number' || typeof value === 'string') {
      return value;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    return '';
  }

  private toNumberValue(value: TableCellValue): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    if (value === null || value === undefined) {
      return 0;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private toStringValue(value: TableCellValue): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }

  private applyRowFilter(rows: TableRow[], filter: TableFilter): TableRow[] {
    return rows.filter((row) => {
      const value = row[filter.columnId];
      const compareValue = filter.value;
      const compareSingle = Array.isArray(compareValue) ? compareValue[0] : compareValue;

      switch (filter.operator) {
        case 'eq':
          return filter.caseSensitive
            ? value === compareSingle
            : this.toStringValue(value).toLowerCase() === this.toStringValue(compareSingle).toLowerCase();
        case 'ne':
          return filter.caseSensitive
            ? value !== compareSingle
            : this.toStringValue(value).toLowerCase() !== this.toStringValue(compareSingle).toLowerCase();
        case 'gt':
          return this.toNumberValue(value) > this.toNumberValue(compareSingle);
        case 'gte':
          return this.toNumberValue(value) >= this.toNumberValue(compareSingle);
        case 'lt':
          return this.toNumberValue(value) < this.toNumberValue(compareSingle);
        case 'lte':
          return this.toNumberValue(value) <= this.toNumberValue(compareSingle);
        case 'contains':
          return this.toStringValue(value).toLowerCase().includes(this.toStringValue(compareSingle).toLowerCase());
        case 'in':
          return Array.isArray(compareValue) && compareValue.includes(value);
        case 'between':
          return (
            Array.isArray(compareValue) &&
            compareValue.length === 2 &&
            this.toNumberValue(value) >= this.toNumberValue(compareValue[0]) &&
            this.toNumberValue(value) <= this.toNumberValue(compareValue[1])
          );
        default:
          return true;
      }
    });
  }

  /**
   * Ordena um conjunto de linhas
   */
  private applySortToRows(rows: TableRow[], sort: TableSort): TableRow[] {
    return [...rows].sort((a, b) => {
      const aVal = this.toComparableValue(a[sort.columnId]);
      const bVal = this.toComparableValue(b[sort.columnId]);

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Computa colunas dinâmicas para todas as linhas
   */
  computeDynamicColumns(): void {
    const state = this.dataStore.getState();
    const dynamicColumns = state.columns.filter((c) => c.isDynamic);

    if (dynamicColumns.length === 0) return;

    // Para cada linha, computar valores dinâmicos
    for (const row of state.rows) {
      for (const column of dynamicColumns) {
        const compiled = this.dynamicColumnStore.getState().getCompiledExpression(column.id);
        if (compiled) {
          const value = compiled.compute(
            row,
            new Map(), // TODO: Passar registry de tabelas
            state.rows
          );
          this.dynamicColumnCache.set(`${row.id}_${column.id}`, value);
        }
      }
    }
  }

  /**
   * Obtém valor de uma célula (incluindo colunas dinâmicas)
   */
  getValue(rowId: string | number, columnId: string): TableCellValue | undefined {
    const column = this.dataStore.getState().getColumn(columnId);
    if (!column) {
      return undefined;
    }

    // Se dinâmica, usar cache ou computar
    if (column.isDynamic) {
      const cached = this.dynamicColumnCache.get(`${rowId}_${columnId}`);
      if (cached !== undefined) {
        return cached;
      }

      const row = this.dataStore.getState().getRow(rowId);
      if (!row) return undefined;

      const compiled = this.dynamicColumnStore.getState().getCompiledExpression(columnId);
      if (compiled) {
        return compiled.compute(row, new Map(), this.dataStore.getState().rows);
      }

      return undefined;
    }

    // Se real, retornar do row
    const row = this.dataStore.getState().getRow(rowId);
    return row ? row[column.dataSource] : undefined;
  }

  /**
   * Retorna as linhas visíveis (após filtros e ordenação)
   */
  getVisibleRows(): TableRow[] {
    const state = this.dataStore.getState();
    const source = state.sortedRows?.length ? state.sortedRows : state.rows;
    return [...source];
  }

  /**
   * Retorna filtros ativos
   */
  getFilters(): TableFilter[] {
    return [...this.filterStore.getState().filters];
  }

  /**
   * Retorna ordenações ativas
   */
  getSorts(): TableSort[] {
    return [...this.sortStore.getState().sorts];
  }

  /**
   * Cria um snapshot do estado atual da tabela
   */
  createSnapshot(): TableSnapshot {
    const state = this.dataStore.getState();
    const filterState = this.filterStore.getState();
    const sortState = this.sortStore.getState();

    const contentHash = this.computeContentHash(state.rows, state.columns, filterState.filters, sortState.sorts);

    const snapshot: TableSnapshot = {
      tableId: this.id,
      timestamp: Date.now(),
      rows: [...state.rows],
      filters: [...filterState.filters],
      sorts: [...sortState.sorts],
      columns: [...state.columns],
      contentHash,
    };

    this.snapshotStore.getState().addSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Restaura a tabela a um snapshot anterior
   */
  restoreSnapshot(snapshot: TableSnapshot): void {
    if (snapshot.tableId !== this.id) {
      throw new Error(`Snapshot não pertence a esta tabela`);
    }

    this.dataStore.getState().setRows(snapshot.rows);
    this.dataStore.getState().setColumns(snapshot.columns);
    this.filterStore.getState().clearFilters();
    this.sortStore.getState().clearSorts();

    for (const filter of snapshot.filters) {
      this.filterStore.getState().addFilter(filter);
    }

    this.sortStore.getState().setSorts(snapshot.sorts);

    this.invalidateDynamicColumnCache();

    if (this.trackHistory) {
      this.historyStore.getState().addEntry({
        operation: 'update',
        timestamp: Date.now(),
        description: `Tabela restaurada do snapshot de ${new Date(snapshot.timestamp).toLocaleString()}`,
      });
    }

    console.log(`[Table] Tabela restaurada de snapshot: "${this.name}"`);
  }

  /**
   * Obtém snapshot do estado atual (para sincronização)
   */
  getSnapshot(): TableSnapshot {
    return this.createSnapshot();
  }

  /**
   * Hidrata a tabela a partir de um snapshot
   */
  hydrate(snapshot: TableSnapshot): void {
    this.restoreSnapshot(snapshot);
  }

  /**
   * Substitui todas as linhas atuais por um novo conjunto
   */
  setRows(rows: TableRow[]): void {
    this.dataStore.getState().setRows(rows);
    this.invalidateDynamicColumnCache();
  }

  /**
   * Calcula hash do conteúdo para detectar mudanças
   */
  private computeContentHash(
    rows: TableRow[],
    columns: TableColumn[],
    filters: TableFilter[],
    sorts: TableSort[]
  ): string {
    const content = JSON.stringify({ rows, columns, filters, sorts });
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
  }

  /**
   * Invalida cache de colunas dinâmicas
   */
  private invalidateDynamicColumnCache(): void {
    this.dynamicColumnCache.clear();
  }

  /**
   * Valida uma linha contra as validações definidas
   */
  private validateRow(row: TableRow): void {
    for (const [columnId, validation] of this.validations.entries()) {
      const value = row[columnId];

      if (validation.required && (value === null || value === undefined || value === '')) {
        throw new Error(`Campo obrigatório: ${columnId}`);
      }

      if (value !== null && value !== undefined) {
        const numValue = typeof value === 'number' ? value : undefined;
        if (validation.min !== undefined && numValue !== undefined && numValue < validation.min) {
          throw new Error(`Valor mínimo para ${columnId}: ${validation.min}`);
        }

        if (validation.max !== undefined && numValue !== undefined && numValue > validation.max) {
          throw new Error(`Valor máximo para ${columnId}: ${validation.max}`);
        }

        if (validation.minLength !== undefined && String(value).length < validation.minLength) {
          throw new Error(`Comprimento mínimo para ${columnId}: ${validation.minLength}`);
        }

        if (validation.maxLength !== undefined && String(value).length > validation.maxLength) {
          throw new Error(`Comprimento máximo para ${columnId}: ${validation.maxLength}`);
        }

        if (validation.pattern && !validation.pattern.test(String(value))) {
          throw new Error(`Formato inválido para ${columnId}`);
        }

        if (validation.validators) {
          for (const validator of validation.validators) {
            const result = validator(value);
            if (result !== true) {
              throw new Error(
                typeof result === 'string' ? result : `Validação falhou para ${columnId}`
              );
            }
          }
        }
      }
    }
  }

  /**
   * Limpa e destrói a tabela
   */
  destroy(): void {
    this.invalidateDynamicColumnCache();
    this.historyStore.getState().clearHistory();
    this.snapshotStore.getState().clearSnapshots();
    this.filterStore.getState().clearFilters();
    this.sortStore.getState().clearSorts();
    this.dynamicColumnStore.getState().clearCompiledExpressions();
    console.log(`[Table] Tabela destruída: "${this.name}"`);
  }
}
