/**
 * Table Render Hook & Integration
 * Hook que permite consumir uma tabela no React e manter estado reativo.
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Table } from './Table';
import { TableRow, TableColumn, TableFilter, TableSort, TableCellValue } from './types';

/**
 * Hook para consumir uma tabela no React
 * Retorna estado reativo e funções para manipular a tabela
 */
export function useTable(table: Table) {
  const [, setTrigger] = useState(0);
  const tableRef = useRef(table);

  // Forçar re-render quando a tabela muda (simplificado, pode usar Zustand listeners)
  const rerender = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  useEffect(() => {
    tableRef.current = table;
  }, [table]);

  return {
    // Dados
    rows: table.getRows(),
    visibleRows: table.getVisibleRows(),
    columns: table.getColumns(),
    snapshots: table.getSnapshots(),
    history: table.getHistory(),
    filters: table.getFilters(),
    sorts: table.getSorts(),

    // Informações
    id: table.id,
    name: table.name,
    realEscope: table.realEscope,

    // CRUD (apenas realEscope: true)
    create: useCallback(
      (row: Omit<TableRow, 'id'>) =>
        tableRef.current.create(row).then((id) => {
          rerender();
          return id;
        }),
      [rerender]
    ),

    update: useCallback(
      (rowId: string | number, changes: Partial<TableRow>) =>
        tableRef.current.update(rowId, changes).then(() => {
          rerender();
        }),
      [rerender]
    ),

    delete: useCallback(
      (rowId: string | number) =>
        tableRef.current.delete(rowId).then(() => {
          rerender();
        }),
      [rerender]
    ),

    // Colunas
    addDynamicColumn: useCallback(
      (column: TableColumn) =>
        tableRef.current.addDynamicColumn(column).then(() => {
          rerender();
        }),
      [rerender]
    ),

    addColumn: useCallback(
      (column: TableColumn, options?: { fillValue?: TableCellValue }) =>
        tableRef.current.addColumn(column, options).then(() => {
          rerender();
        }),
      [rerender]
    ),

    updateColumn: useCallback(
      (columnId: string, updates: Partial<TableColumn>) =>
        tableRef.current.updateColumn(columnId, updates).then(() => {
          rerender();
        }),
      [rerender]
    ),

    deleteColumn: useCallback(
      (columnId: string) =>
        tableRef.current.deleteColumn(columnId).then(() => {
          rerender();
        }),
      [rerender]
    ),

    renameColumn: useCallback(
      (columnId: string, newAlias: string) =>
        tableRef.current.renameColumn(columnId, newAlias).then(() => {
          rerender();
        }),
      [rerender]
    ),

    setColumnOrder: useCallback(
      (columnOrder: string[]) => {
        tableRef.current.setColumnOrder(columnOrder);
        rerender();
      },
      [rerender]
    ),

    // Filtros e ordenação
    applyFilter: useCallback(
      (filter: TableFilter) => {
        tableRef.current.applyFilter(filter);
        rerender();
      },
      [rerender]
    ),

    clearFilter: useCallback(
      (filterId?: string) => {
        tableRef.current.clearFilter(filterId);
        rerender();
      },
      [rerender]
    ),

    applySort: useCallback(
      (sorts: TableSort[]) => {
        tableRef.current.applySort(sorts);
        rerender();
      },
      [rerender]
    ),

    // Snapshots
    createSnapshot: useCallback(() => {
      return tableRef.current.createSnapshot();
    }, []),

    restoreSnapshot: useCallback(
      (snapshot: TableSnapshot) => {
        tableRef.current.restoreSnapshot(snapshot);
        rerender();
      },
      [rerender]
    ),

    // Valores dinâmicos
    getValue: useCallback(
      (rowId: string | number, columnId: string) =>
        tableRef.current.getValue(rowId, columnId),
      []
    ),

    setRows: useCallback((rows: TableRow[]) => {
      tableRef.current.setRows(rows);
      rerender();
    }, [rerender]),
  };
}

/**
 * Hook para gerenciar múltiplas tabelas
 */
export function useTableManager() {
  const tablesRef = useRef<Map<string, Table>>(new Map());

  return {
    addTable: (table: Table, id?: string) => {
      const finalId = id || table.id;
      tablesRef.current.set(finalId, table);
      return finalId;
    },

    getTable: (id: string) => tablesRef.current.get(id),

    removeTable: (id: string) => {
      const table = tablesRef.current.get(id);
      if (table) {
        table.destroy();
        tablesRef.current.delete(id);
      }
    },

    getTables: () => Array.from(tablesRef.current.values()),

    getTableIds: () => Array.from(tablesRef.current.keys()),
  };
}
