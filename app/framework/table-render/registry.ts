/**
 * Table Registry
 * Armazena todas as instâncias de tabelas com IDs únicos e oferece acesso centralizado
 */

import { Table } from './types';
import crypto from 'crypto';

export type TableId = string;

/**
 * Registry centralizado de todas as tabelas criadas
 * Singleton que mantém mapa de tabelas e oferece operações de lookup
 */
export class TableRegistry {
  private static instance: TableRegistry;
  private tables: Map<TableId, Table> = new Map();
  private idToName: Map<TableId, string> = new Map();
  private nameToId: Map<string, TableId> = new Map();

  /**
   * Obtém a instância singleton do registro
   */
  static getInstance(): TableRegistry {
    if (!TableRegistry.instance) {
      TableRegistry.instance = new TableRegistry();
    }
    return TableRegistry.instance;
  }

  /**
   * Gera um ID único para a tabela
   */
  private generateId(): string {
    return `table_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Registra uma nova tabela no registro
   * @param table Instância da tabela
   * @param customId ID customizado (opcional). Se não fornecido, gera automaticamente
   * @returns ID atribuído à tabela
   * @throws Se houver conflito de IDs
   */
  register(table: Table, customId?: string): TableId {
    const id = customId || this.generateId();

    // Validar conflitos de ID
    if (this.tables.has(id)) {
      throw new Error(
        `Conflito de ID de tabela: "${id}" já está registrado. Use um ID diferente ou deixe vazio para geração automática.`
      );
    }

    // Validar conflitos de nome (nomes devem ser únicos para queries)
    if (this.nameToId.has(table.name)) {
      const existingId = this.nameToId.get(table.name)!;
      throw new Error(
        `Conflito de nome: Tabela "${table.name}" já registrada com ID "${existingId}". Use um nome diferente.`
      );
    }

    // Registrar
    this.tables.set(id, table);
    this.idToName.set(id, table.name);
    this.nameToId.set(table.name, id);

    console.log(
      `[TableRegistry] Tabela registrada: "${table.name}" (ID: ${id}, realEscope: ${table.realEscope})`
    );

    return id;
  }

  /**
   * Obtém uma tabela pelo ID
   */
  get(id: TableId): Table | undefined {
    return this.tables.get(id);
  }

  /**
   * Obtém uma tabela pelo nome
   */
  getByName(name: string): Table | undefined {
    const id = this.nameToId.get(name);
    return id ? this.tables.get(id) : undefined;
  }

  /**
   * Lista todos os IDs de tabelas registradas
   */
  getAllIds(): TableId[] {
    return Array.from(this.tables.keys());
  }

  /**
   * Lista todas as tabelas
   */
  getAll(): Table[] {
    return Array.from(this.tables.values());
  }

  /**
   * Lista todas as tabelas reais (realEscope: true)
   */
  getAllReal(): Table[] {
    return Array.from(this.tables.values()).filter((t) => t.realEscope);
  }

  /**
   * Lista todas as tabelas imaginárias (realEscope: false)
   */
  getAllImaginary(): Table[] {
    return Array.from(this.tables.values()).filter((t) => !t.realEscope);
  }

  /**
   * Remove uma tabela do registro
   * @throws Se a tabela não existir
   */
  remove(id: TableId): void {
    const table = this.tables.get(id);

    if (!table) {
      throw new Error(`Tabela com ID "${id}" não encontrada no registro`);
    }

    this.tables.delete(id);
    const name = this.idToName.get(id)!;
    this.idToName.delete(id);
    this.nameToId.delete(name);

    // Limpar recursos da tabela
    table.destroy();

    console.log(`[TableRegistry] Tabela removida: "${name}" (ID: ${id})`);
  }

  /**
   * Remove uma tabela pelo nome
   */
  removeByName(name: string): void {
    const id = this.nameToId.get(name);
    if (!id) {
      throw new Error(`Tabela com nome "${name}" não encontrada no registro`);
    }
    this.remove(id);
  }

  /**
   * Verifica se uma tabela está registrada
   */
  has(id: TableId): boolean {
    return this.tables.has(id);
  }

  /**
   * Verifica se existe tabela com este nome
   */
  hasByName(name: string): boolean {
    return this.nameToId.has(name);
  }

  /**
   * Retorna estatísticas do registro
   */
  getStats(): {
    totalTables: number;
    realTables: number;
    imaginaryTables: number;
    tableNames: string[];
  } {
    const all = Array.from(this.tables.values());
    return {
      totalTables: all.length,
      realTables: all.filter((t) => t.realEscope).length,
      imaginaryTables: all.filter((t) => !t.realEscope).length,
      tableNames: all.map((t) => t.name),
    };
  }

  /**
   * Limpa completamente o registro (útil em testes ou reset)
   * AVISO: Esta operação é irreversível!
   */
  clear(): void {
    // Destruir todas as tabelas
    this.tables.forEach((table) => table.destroy());

    this.tables.clear();
    this.idToName.clear();
    this.nameToId.clear();

    console.warn('[TableRegistry] Registro completamente limpo');
  }

  /**
   * Exporta o estado do registro para persistência
   */
  export(): {
    tables: Array<{ id: TableId; name: string }>;
    stats: ReturnType<TableRegistry['getStats']>;
  } {
    return {
      tables: Array.from(this.idToName.entries()).map(([id, name]) => ({ id, name })),
      stats: this.getStats(),
    };
  }
}

/**
 * Instância global do registro
 */
export const tableRegistry = TableRegistry.getInstance();

/**
 * Helpers para acesso rápido
 */
export const registerTable = (table: Table, customId?: string): TableId => {
  return tableRegistry.register(table, customId);
};

export const getTable = (id: TableId): Table | undefined => {
  return tableRegistry.get(id);
};

export const getTableByName = (name: string): Table | undefined => {
  return tableRegistry.getByName(name);
};

export const removeTable = (id: TableId): void => {
  tableRegistry.remove(id);
};
