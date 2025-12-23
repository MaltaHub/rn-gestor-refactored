'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Table, tableRegistry, useTable } from '@/app/framework/table-render';
import { TableConfig, TableColumn, TableRow } from '@/app/framework/table-render/types';

type TablePanelProps = {
  table: Table;
  tableId: string;
  api: ReturnType<typeof useTable>;
  columnOrder: Record<string, string[]>;
  defaultColumnOrder: Record<string, string[]>;
  setColumnOrder: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  snapshots: Record<string, any[]>;
  setSnapshots: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  showHistory: Record<string, boolean>;
  setShowHistory: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  addLog: (message: string) => void;
  tableType: 'original' | 'reference';
  indexColumnId: string;
  referenceSourceLabel?: string;
};

type EditingCellState = {
  rowId: string | number;
  columnId: string;
  value: any;
};

type ActionDialogState = {
  type: 'cell' | 'row' | 'column';
  title: string;
  description?: string;
  meta: Record<string, any>;
  anchor: { x: number; y: number };
};

type HubTableType = 'original' | 'reference';

type HubTableMeta = {
  id: string;
  label: string;
  description?: string;
  table: Table;
  type: HubTableType;
  indexColumnId: string;
  referenceSourceId?: string;
  referenceSourceLabel?: string;
  referenceColumns?: string[];
};

const PLACEHOLDER_TABLE_CONFIG = (id: string): TableConfig => ({
  id,
  name: 'Placeholder',
  rows: [],
  columns: [],
  realEscope: false,
  trackHistory: false,
  allowDynamicColumns: false,
});

const TablePanel: React.FC<TablePanelProps> = ({
  table,
  tableId,
  api,
  columnOrder,
  defaultColumnOrder,
  setColumnOrder,
  snapshots,
  setSnapshots,
  showHistory,
  setShowHistory,
  addLog,
  tableType,
  indexColumnId,
  referenceSourceLabel,
}) => {
  const [editingCell, setEditingCell] = useState<EditingCellState | null>(null);
  const [contextDialog, setContextDialog] = useState<ActionDialogState | null>(null);

  const visibleColumns = useMemo(() => {
    let cols = api.columns;
    const order = columnOrder[tableId] || [];
    if (order.length > 0) {
      const orderMap = new Map(order.map((colId, idx) => [colId, idx]));
      cols = [...cols].sort((a: TableColumn, b: TableColumn) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
    }
    return cols.filter((c: TableColumn) => !c.isHidden);
  }, [api.columns, columnOrder, tableId]);

  const stats = useMemo(
    () => [
      { label: 'Linhas totais', value: api.rows.length },
      { label: 'Linhas visíveis', value: api.visibleRows.length },
      { label: 'Filtros ativos', value: api.filters.length },
      { label: 'Ordenações', value: api.sorts.length },
    ],
    [api.rows.length, api.visibleRows.length, api.filters.length, api.sorts.length]
  );

  const updateColumnOrderState = (order: string[]) => {
    api.setColumnOrder(order);
    setColumnOrder((prev) => ({ ...prev, [tableId]: order }));
  };

  const shuffleColumns = () => {
    const order = visibleColumns.map((c) => c.id).sort(() => Math.random() - 0.5);
    updateColumnOrderState(order);
    addLog('🔀 Colunas reorganizadas aleatoriamente');
  };

  const reverseColumns = () => {
    const order = visibleColumns.map((c) => c.id).reverse();
    updateColumnOrderState(order);
    addLog('↕️ Ordem das colunas invertida');
  };

  const resetColumns = () => {
    const originalOrder = defaultColumnOrder[tableId] || api.columns.map((c: TableColumn) => c.id);
    updateColumnOrderState(originalOrder);
    addLog('✨ Layout de colunas restaurado');
  };

  const applyQuickFilter = () => {
    const target = visibleColumns.find((col) => !col.isDynamic);
    if (!target) return;
    api.applyFilter({
      id: `quick_${target.id}`,
      columnId: target.id,
      operator: 'contains',
      value: 'a',
    });
    addLog(`🔍 Filtro rápido aplicado em "${target.alias || target.dataSource}"`);
  };

  const formatValue = (column: TableColumn, value: any) => {
    if (value === null || value === undefined || value === '') return '—';
    if (column.dataType === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    if (column.dataType === 'number' && typeof value === 'number') {
      return value.toLocaleString('pt-BR');
    }
    return value;
  };

  const startEditingCell = (rowId: string | number, column: TableColumn, value: any) => {
    if (!table.realEscope || column.isDynamic || column.isReadOnly) {
      addLog('ℹ️ Esta célula é somente leitura');
      return;
    }
    setEditingCell({
      rowId,
      columnId: column.id,
      value: value ?? '',
    });
  };

  const saveEditingCell = async () => {
    if (!editingCell) return;
    const column = api.columns.find((col) => col.id === editingCell.columnId);
    if (!column || !table.realEscope) {
      setEditingCell(null);
      return;
    }

    let nextValue: any = editingCell.value;
    if ((column.dataType === 'number' || column.dataType === 'currency') && nextValue !== '') {
      const parsed = Number(nextValue);
      if (!Number.isNaN(parsed)) {
        nextValue = parsed;
      }
    }

    try {
      await table.update(editingCell.rowId, { [column.dataSource]: nextValue });
      addLog(`✏️ ${column.alias || column.dataSource} atualizado na linha ${editingCell.rowId}`);
    } catch (error) {
      addLog(`⚠️ Falha ao atualizar célula: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setEditingCell(null);
    }
  };

  const clearCell = async (rowId: string | number, columnId: string) => {
    if (!table.realEscope) return;
    const column = api.columns.find((col) => col.id === columnId);
    if (!column) return;
    try {
      await table.update(rowId, { [column.dataSource]: '' });
      addLog(`🧽 Célula limpa na linha ${rowId}`);
    } catch (error) {
      addLog(`⚠️ Falha ao limpar célula: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const createRowPayload = () => {
    const payload: Record<string, any> = {};
    api.columns.forEach((col) => {
      if (!col.isDynamic) {
        payload[col.dataSource] = '';
      }
    });
    return payload;
  };

  const insertRow = async () => {
    if (!table.realEscope) {
      addLog('ℹ️ Esta tabela é somente leitura');
      return;
    }
    try {
      await table.create(createRowPayload());
      addLog('➕ Nova linha adicionada ao final da tabela');
    } catch (error) {
      addLog(`⚠️ Falha ao adicionar linha: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const duplicateRow = async (rowId: string | number) => {
    if (!table.realEscope) return;
    const row = table.getRows().find((r) => String(r.id) === String(rowId));
    if (!row) return;
    const payload = { ...row };
    delete payload.id;
    try {
      await table.create(payload);
      addLog(`🧬 Linha ${rowId} duplicada`);
    } catch (error) {
      addLog(`⚠️ Falha ao duplicar linha: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const deleteRow = async (rowId: string | number) => {
    if (!table.realEscope) return;
    try {
      await table.delete(rowId);
      addLog(`🗑️ Linha ${rowId} removida`);
    } catch (error) {
      addLog(`⚠️ Falha ao remover linha: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const sortColumn = (columnId: string, direction: 'asc' | 'desc') => {
    api.applySort([{ columnId, direction }]);
    addLog(`↕️ Ordenação ${direction === 'asc' ? 'crescente' : 'decrescente'} aplicada`);
  };

  const hideColumn = async (columnId: string) => {
    try {
      await table.updateColumn(columnId, { isHidden: true });
      addLog(`🙈 Coluna ${columnId} oculta da visualização`);
    } catch (error) {
      addLog(`⚠️ Falha ao ocultar coluna: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const openCellDialog = (
    event: React.MouseEvent,
    rowId: string | number,
    column: TableColumn,
    value: any,
    rowIndex: number
  ) => {
    setContextDialog({
      type: 'cell',
      title: column.alias || column.dataSource,
      description: `Linha #${rowIndex + 1}`,
      meta: { rowId, columnId: column.id, value },
      anchor: { x: event.pageX, y: event.pageY },
    });
  };

  const openRowDialog = (event: React.MouseEvent, rowId: string | number, rowIndex: number) => {
    setContextDialog({
      type: 'row',
      title: `Linha #${rowIndex + 1}`,
      description: table.realEscope ? 'Gerencie a linha selecionada' : 'Linha somente leitura',
      meta: { rowId },
      anchor: { x: event.pageX, y: event.pageY },
    });
  };

  const openColumnDialog = (event: React.MouseEvent, column: TableColumn) => {
    setContextDialog({
      type: 'column',
      title: column.alias || column.dataSource,
      description: 'Aplique ações rápidas à coluna',
      meta: { columnId: column.id },
      anchor: { x: event.pageX, y: event.pageY },
    });
  };

  const copyValue = async (value: any) => {
    try {
      await navigator.clipboard?.writeText(String(value ?? ''));
      addLog('📋 Valor copiado para a área de transferência');
    } catch {
      addLog('⚠️ Não foi possível copiar o valor');
    }
  };

  const ActionDialog = () => {
    if (!contextDialog) return null;
    const { type, title, description, meta, anchor } = contextDialog;
    const column = meta?.columnId ? api.columns.find((col) => col.id === meta.columnId) : undefined;

    const closeDialog = () => setContextDialog(null);
    const rawX = Number.isFinite(anchor?.x) ? anchor!.x : window.innerWidth / 2;
    const rawY = Number.isFinite(anchor?.y) ? anchor!.y : window.scrollY + window.innerHeight / 2;
    const viewportX = Math.min(rawX, window.innerWidth - 320);
    const viewportY = Math.min(rawY, window.scrollY + window.innerHeight - 220);
    const top = Math.max(12, viewportY - window.scrollY + 12);
    const left = Math.max(12, viewportX - 12);

    return (
      <div className="pointer-events-none fixed inset-0 z-50">
        <div
          className="pointer-events-auto w-72 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          style={{
            position: 'absolute',
            top,
            left,
          }}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {type === 'cell' && 'Célula selecionada'}
                {type === 'row' && 'Linha selecionada'}
                {type === 'column' && 'Coluna selecionada'}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
              <button onClick={closeDialog} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900">
                Fechar
              </button>
            </div>

            <div className="space-y-2">
            {type === 'cell' && (
              <>
                <button
                  onClick={() => {
                    closeDialog();
                    void copyValue(meta?.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-700 hover:border-slate-300"
                >
                  Copiar valor
                </button>
                {table.realEscope && column && !column.isDynamic && !column.isReadOnly && (
                  <>
                    <button
                      onClick={() => {
                        closeDialog();
                        startEditingCell(meta.rowId, column, meta.value);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-700 hover:border-slate-300"
                    >
                      Editar célula
                    </button>
                    <button
                      onClick={() => {
                        closeDialog();
                        void clearCell(meta.rowId, meta.columnId);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-700 hover:border-slate-300"
                    >
                      Limpar conteúdo
                    </button>
                  </>
                )}
              </>
            )}

            {type === 'row' && (
              <>
                {table.realEscope ? (
                  <>
                    <button
                      onClick={() => {
                        closeDialog();
                        void duplicateRow(meta.rowId);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-700 hover:border-slate-300"
                    >
                      Duplicar linha
                    </button>
                    <button
                      onClick={() => {
                        closeDialog();
                        void deleteRow(meta.rowId);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-red-600 hover:border-red-300"
                    >
                      Remover linha
                    </button>
                  </>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                    Esta tabela é somente leitura
                  </p>
                )}
              </>
            )}

            {type === 'column' && (
              <>
                <button
                  onClick={() => {
                    closeDialog();
                    sortColumn(meta.columnId, 'asc');
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-700 hover:border-slate-300"
                >
                  Ordenar A → Z
                </button>
                <button
                  onClick={() => {
                    closeDialog();
                    sortColumn(meta.columnId, 'desc');
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-700 hover:border-slate-300"
                >
                  Ordenar Z → A
                </button>
                <button
                  onClick={() => {
                    closeDialog();
                    void hideColumn(meta.columnId);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-700 hover:border-slate-300"
                >
                  Ocultar coluna
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const snapshotsList = snapshots[tableId] || [];

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {tableType === 'original' ? 'Tabela original' : 'Tabela referencial'}
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">{table.name}</h2>
          <p className="text-sm text-slate-500">
            Índice: <span className="font-mono text-slate-700">{indexColumnId}</span>
            {referenceSourceLabel && (
              <span className="ml-2 text-xs text-slate-400">Referência de {referenceSourceLabel}</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={reverseColumns}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
          >
            Inverter colunas
          </button>
          <button
            onClick={shuffleColumns}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
          >
            Baralhar
          </button>
          <button
            onClick={resetColumns}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
          >
            Layout padrão
          </button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
        <div className="text-sm text-slate-600">Controle refinado sobre filtros e ordenações</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={applyQuickFilter}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300"
          >
            Filtro rápido
          </button>
          <button
            onClick={() => {
              api.clearFilter();
              addLog('🧹 Todos os filtros foram limpos');
            }}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300"
          >
            Limpar filtros
          </button>
          <span className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-500">
            {api.filters.length} filtros
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-32 px-4 py-3">Linha</th>
                {visibleColumns.map((col: TableColumn) => (
                  <th
                    key={col.id}
                    className="cursor-pointer px-4 py-3 transition hover:bg-slate-100"
                    onClick={(event) => openColumnDialog(event, col)}
                  >
                    <span>{col.alias || col.dataSource}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {api.visibleRows.length > 0 ? (
                api.visibleRows.map((row: TableRow, idx: number) => (
                  <tr key={row.id} className="border-t border-slate-100 transition-colors hover:bg-blue-50">
                    <td
                      className="px-4 py-2 align-middle text-xs font-semibold text-slate-500"
                      onClick={(event) => openRowDialog(event, row.id, idx)}
                    >
                      <div className="flex items-center gap-2">
                        <span>#{idx + 1}</span>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            insertRow();
                          }}
                          className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-slate-300 disabled:cursor-not-allowed disabled:text-slate-300"
                          disabled={!table.realEscope}
                          title="Adicionar nova linha"
                        >
                          ＋
                        </button>
                      </div>
                    </td>
                    {visibleColumns.map((col: TableColumn) => {
                      const value = api.getValue(row.id, col.id);
                      const display = formatValue(col, value);
                      const isEditing = editingCell && editingCell.rowId === row.id && editingCell.columnId === col.id;
                      return (
                        <td
                          key={col.id}
                          className="group px-4 py-3 align-middle text-sm text-slate-700"
                          onDoubleClick={() => startEditingCell(row.id, col, value)}
                          onClick={(event) => {
                            event.stopPropagation();
                            openCellDialog(event, row.id, col, value, idx);
                          }}
                        >
                          {isEditing ? (
                            <input
                              value={editingCell.value ?? ''}
                              autoFocus
                              onChange={(e) => setEditingCell((prev) => (prev ? { ...prev, value: e.target.value } : prev))}
                              onBlur={() => {
                                void saveEditingCell();
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  void saveEditingCell();
                                }
                                if (event.key === 'Escape') {
                                  setEditingCell(null);
                                }
                              }}
                              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                          ) : (
                            <span className="block truncate">{display}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="px-4 py-6 text-center text-sm text-slate-500">
                    Nenhum resultado encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Snapshots</p>
              <p className="text-xs text-slate-500">Armazene o estado atual da visão</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{snapshotsList.length}</span>
          </div>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => {
                const snapshot = api.createSnapshot();
                setSnapshots((prev) => ({
                  ...prev,
                  [tableId]: [...snapshotsList, snapshot],
                }));
                addLog(`📸 Snapshot criado (${snapshot.rows.length} linhas)`);
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
            >
              Salvar snapshot
            </button>
            {snapshotsList.length > 0 && (
              <button
                onClick={() => {
                  const latestSnapshot = snapshotsList[snapshotsList.length - 1];
                  api.restoreSnapshot(latestSnapshot);
                  addLog('🕑 Snapshot restaurado');
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
              >
                Restaurar último
              </button>
            )}
          </div>
        </div>

        {table.trackHistory && (
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Histórico</p>
                <p className="text-xs text-slate-500">Últimas alterações registradas</p>
              </div>
              <button
                onClick={() => setShowHistory((prev) => ({ ...prev, [tableId]: !prev[tableId] }))}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300"
              >
                {showHistory[tableId] ? 'Ocultar' : 'Ver'}
              </button>
            </div>
            {showHistory[tableId] && (
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                {(api.history || []).slice(-8).map((entry: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                    <div className="font-mono text-[11px]">{entry.description}</div>
                    <div className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {contextDialog && <ActionDialog />}
    </section>
  );
};

/**
 * DEMONSTRAÇÃO COMPLETA - Table Render Framework v2.0
 * 
 * ✅ FUNCIONALIDADES PADRÃO GARANTIDAS:
 * • Filtros habilitados por padrão em todas as colunas
 * • Reordenação de colunas habilitada por padrão
 * • Ordenação habilitada por padrão
 * • Histórico rastreado automaticamente
 * • Snapshots disponíveis para todas as tabelas
 */
export function TableRenderDemo() {
  const [output, setOutput] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<Record<string, string[]>>({});
  const [defaultColumnOrder, setDefaultColumnOrder] = useState<Record<string, string[]>>({});
  const [snapshots, setSnapshots] = useState<Record<string, any[]>>({});
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({});
  const [hubTables, setHubTables] = useState<Record<string, HubTableMeta>>({});
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [newOriginalForm, setNewOriginalForm] = useState({ name: '', index: 'codigo', columns: 'descricao,valor' });
  const [newReferenceForm, setNewReferenceForm] = useState<{ name: string; sourceId: string; selectedColumns: string[] }>({
    name: '',
    sourceId: '',
    selectedColumns: [],
  });

  const placeholderTables = useMemo(
    () => ({
      base: new Table(PLACEHOLDER_TABLE_CONFIG('placeholder_base')),
    }),
    []
  );

  const addLog = useCallback((message: string) => {
    setOutput((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const prettifyLabel = useCallback(
    (value: string) =>
      value
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    []
  );

  const registerHubTable = useCallback((meta: HubTableMeta, options?: { activate?: boolean }) => {
    setHubTables((prev) => ({ ...prev, [meta.id]: meta }));
    setDefaultColumnOrder((prev) => ({ ...prev, [meta.id]: meta.table.getColumns().map((col) => col.id) }));
    if (options?.activate) {
      setActiveTableId(meta.id);
    }
  }, []);

  const syncReferenceRows = useCallback((baseId: string) => {
    setHubTables((prev) => {
      const base = prev[baseId];
      if (!base) return prev;
      const baseRows = base.table.getRows();
      let updated = false;
      const next = { ...prev };
      Object.values(next).forEach((meta) => {
        if (meta.type === 'reference' && meta.referenceSourceId === baseId) {
          const refColumns =
            meta.referenceColumns && meta.referenceColumns.length > 0
              ? meta.referenceColumns
              : meta.table.getColumns().map((col) => col.id);
          const uniqueColumns = Array.from(new Set([meta.indexColumnId, ...refColumns]));
          const clonedRows = baseRows.map((row) => {
            const cloned: TableRow = { id: row.id };
            uniqueColumns.forEach((colId) => {
              cloned[colId] = row[colId];
            });
            return cloned;
          });
          meta.table.setRows(clonedRows);
          next[meta.id] = { ...meta };
          updated = true;
        }
      });
      return updated ? next : prev;
    });
  }, []);

  const buildBaseCallbacks = useCallback(
    (tableId: string): TableConfig['callbacks'] => ({
      onCreate: async () => {
        syncReferenceRows(tableId);
      },
      onUpdate: async () => {
        syncReferenceRows(tableId);
      },
      onDelete: async () => {
        syncReferenceRows(tableId);
      },
    }),
    [syncReferenceRows]
  );

  const removeHubTable = useCallback(
    (tableId: string) => {
      const target = hubTables[tableId];
      if (!target) return;
      const cascadeIds =
        target.type === 'original'
          ? Object.values(hubTables)
              .filter((meta) => meta.referenceSourceId === tableId)
              .map((meta) => meta.id)
          : [];
      const idsToRemove = [tableId, ...cascadeIds];
      setHubTables((prev) => {
        const next = { ...prev };
        idsToRemove.forEach((id) => delete next[id]);
        return next;
      });
      setColumnOrder((prev) => {
        const next = { ...prev };
        idsToRemove.forEach((id) => delete next[id]);
        return next;
      });
      setDefaultColumnOrder((prev) => {
        const next = { ...prev };
        idsToRemove.forEach((id) => delete next[id]);
        return next;
      });
      setSnapshots((prev) => {
        const next = { ...prev };
        idsToRemove.forEach((id) => delete next[id]);
        return next;
      });
      setShowHistory((prev) => {
        const next = { ...prev };
        idsToRemove.forEach((id) => delete next[id]);
        return next;
      });
      if (idsToRemove.includes(activeTableId ?? '')) {
        setActiveTableId(null);
      }
      idsToRemove.forEach((id) => {
        try {
          tableRegistry.remove(id);
        } catch {
          /* noop */
        }
      });
      addLog(`🗂️ Tabela${idsToRemove.length > 1 ? 's' : ''} removida${idsToRemove.length > 1 ? 's' : ''}: ${idsToRemove.join(', ')}`);
    },
    [hubTables, activeTableId, addLog]
  );

  const handleCreateOriginal = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const trimmedName = newOriginalForm.name.trim() || `Tabela ${Date.now().toString(36)}`;
      const rawColumns = newOriginalForm.columns
        .split(',')
        .map((col) => col.trim())
        .filter(Boolean);
      const uniqueColumns = Array.from(new Set([newOriginalForm.index.trim(), ...rawColumns].filter(Boolean)));
      if (uniqueColumns.length === 0) {
        addLog('⚠️ Informe ao menos o nome do índice.');
        return;
      }
      const columns: TableColumn[] = uniqueColumns.map((colId, idx) => ({
        id: colId,
        dataSource: colId,
        dataType: 'string',
        isDynamic: false,
        alias: prettifyLabel(colId),
        order: idx + 1,
        isFilterable: true,
        isSortable: true,
      }));
      const tableId = `tbl_${Date.now().toString(36)}`;
      const config: TableConfig = {
        id: tableId,
        name: trimmedName,
        description: 'Tabela criada manualmente',
        realEscope: true,
        rows: [],
        columns,
        trackHistory: true,
        allowDynamicColumns: true,
        callbacks: buildBaseCallbacks(tableId),
      };
      const table = new Table(config);
      tableRegistry.register(table, tableId);
      registerHubTable(
        {
          id: tableId,
          label: trimmedName,
          description: config.description,
          table,
          type: 'original',
          indexColumnId: uniqueColumns[0],
        },
        { activate: true }
      );
      addLog(`🆕 Tabela original criada: "${trimmedName}"`);
      setNewOriginalForm({ name: '', index: newOriginalForm.index, columns: newOriginalForm.columns });
    },
    [newOriginalForm, buildBaseCallbacks, prettifyLabel, registerHubTable, addLog]
  );

  const handleCreateReference = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const base = newReferenceForm.sourceId ? hubTables[newReferenceForm.sourceId] : undefined;
      if (!base) {
        addLog('⚠️ Escolha uma tabela original para referenciar.');
        return;
      }
      const selectedColumns =
        newReferenceForm.selectedColumns.length > 0
          ? newReferenceForm.selectedColumns
          : base.table.getColumns().map((col) => col.id);
      const uniqueColumns = Array.from(new Set([base.indexColumnId, ...selectedColumns]));
      const columnConfigs: TableColumn[] = uniqueColumns.map((colId, idx) => {
        const sourceCol = base.table.getColumns().find((col) => col.id === colId);
        if (sourceCol) {
          return { ...sourceCol, order: idx + 1 };
        }
        return {
          id: colId,
          dataSource: colId,
          dataType: 'string',
          isDynamic: false,
          alias: prettifyLabel(colId),
          order: idx + 1,
          isFilterable: true,
          isSortable: true,
        };
      });
      const rows = base.table.getRows().map((row) => {
        const cloned: TableRow = { id: row.id };
        uniqueColumns.forEach((colId) => {
          cloned[colId] = row[colId];
        });
        return cloned;
      });
      const tableId = `view_${Date.now().toString(36)}`;
      const config: TableConfig = {
        id: tableId,
        name: newReferenceForm.name.trim() || `${base.label} View`,
        description: `Tabela referencial baseada em ${base.label}`,
        realEscope: false,
        rows,
        columns: columnConfigs,
        trackHistory: true,
        allowDynamicColumns: true,
      };
      const table = new Table(config);
      tableRegistry.register(table, tableId);
      registerHubTable(
        {
          id: tableId,
          label: config.name,
          description: config.description,
          table,
          type: 'reference',
          indexColumnId: base.indexColumnId,
          referenceSourceId: base.id,
          referenceSourceLabel: base.label,
          referenceColumns: uniqueColumns,
        },
        { activate: true }
      );
      addLog(`🪄 View criada: "${config.name}" baseada em ${base.label}`);
      setNewReferenceForm((prev) => ({
        ...prev,
        name: '',
        selectedColumns: [],
      }));
    },
    [newReferenceForm, hubTables, prettifyLabel, registerHubTable, addLog]
  );

  useEffect(() => {
    if (Object.keys(hubTables).length > 0) {
      return;
    }
    try {
      addLog('🚀 Iniciando Table Render Demo v2.0...');

      const columnsProducts: TableColumn[] = [
        { id: 'id', dataSource: 'id', dataType: 'string', isDynamic: false, alias: 'ID', order: 1, isFilterable: true, isSortable: true },
        { id: 'name', dataSource: 'name', dataType: 'string', isDynamic: false, alias: 'Nome do Produto', order: 2, isFilterable: true, isSortable: true },
        { id: 'category', dataSource: 'category', dataType: 'string', isDynamic: false, alias: 'Categoria', order: 3, isFilterable: true, isSortable: true },
        { id: 'price', dataSource: 'price', dataType: 'currency', isDynamic: false, alias: 'Preço', order: 4, isFilterable: true, isSortable: true },
        { id: 'stock', dataSource: 'stock', dataType: 'number', isDynamic: false, alias: 'Estoque', order: 5, isFilterable: true, isSortable: true },
        {
          id: 'price_with_tax',
          dataSource: 'price',
          dataType: 'currency',
          isDynamic: true,
          alias: 'Preço com 15% Imposto 📐',
          order: 6,
          isReadOnly: true,
          expression: 'price * 1.15',
        },
      ];
      const rowsProducts: TableRow[] = [
        { id: 'p001', name: 'Notebook Dell', category: 'Eletrônicos', price: 3500, stock: 5 },
        { id: 'p002', name: 'Mouse Logitech', category: 'Periféricos', price: 85, stock: 25 },
        { id: 'p003', name: 'Teclado Mecânico', category: 'Periféricos', price: 450, stock: 15 },
        { id: 'p004', name: 'Monitor LG 27"', category: 'Eletrônicos', price: 1200, stock: 8 },
        { id: 'p005', name: 'Webcam HD', category: 'Periféricos', price: 200, stock: 35 },
      ];
      const productsConfig: TableConfig = {
        id: 'products_demo',
        name: 'Produtos',
        description: 'Demonstração com TODOS os defaults ativados',
        realEscope: true,
        rows: rowsProducts,
        columns: columnsProducts,
        trackHistory: true,
        allowDynamicColumns: true,
        callbacks: buildBaseCallbacks('products_demo'),
      };
      const products = new Table(productsConfig);
      tableRegistry.register(products, 'products_demo');
      registerHubTable(
        { id: 'products_demo', label: 'Produtos', description: productsConfig.description, table: products, type: 'original', indexColumnId: 'id' },
        { activate: true }
      );

      const columnsPrices: TableColumn[] = [
        { id: 'id', dataSource: 'id', dataType: 'string', isDynamic: false, alias: 'ID', order: 1 },
        { id: 'product_name', dataSource: 'product_name', dataType: 'string', isDynamic: false, alias: 'Produto', order: 2 },
        { id: 'cost', dataSource: 'cost', dataType: 'currency', isDynamic: false, alias: 'Custo', order: 3 },
        { id: 'selling_price', dataSource: 'selling_price', dataType: 'currency', isDynamic: false, alias: 'Preço Venda', order: 4 },
        {
          id: 'margin',
          dataSource: 'margin',
          dataType: 'number',
          isDynamic: true,
          alias: 'Margem % 📐',
          order: 5,
          isReadOnly: true,
          expression: '((selling_price - cost) / cost) * 100',
        },
      ];
      const rowsPrices: TableRow[] = [
        { id: 'pr1', product_name: 'Notebook Dell', cost: 2500, selling_price: 3500 },
        { id: 'pr2', product_name: 'Mouse Logitech', cost: 50, selling_price: 85 },
        { id: 'pr3', product_name: 'Teclado Mecânico', cost: 250, selling_price: 450 },
        { id: 'pr4', product_name: 'Monitor LG 27"', cost: 800, selling_price: 1200 },
        { id: 'pr5', product_name: 'Webcam HD', cost: 120, selling_price: 200 },
      ];
      const pricesConfig: TableConfig = {
        id: 'prices_demo',
        name: 'Preços & Margens',
        description: 'Demonstração com colunas calculadas',
        realEscope: true,
        rows: rowsPrices,
        columns: columnsPrices,
        trackHistory: true,
        allowDynamicColumns: true,
        callbacks: buildBaseCallbacks('prices_demo'),
      };
      const prices = new Table(pricesConfig);
      tableRegistry.register(prices, 'prices_demo');
      registerHubTable({
        id: 'prices_demo',
        label: 'Preços & Margens',
        description: pricesConfig.description,
        table: prices,
        type: 'original',
        indexColumnId: 'id',
      });

      const columnsStats: TableColumn[] = [
        { id: 'product_name', dataSource: 'product_name', dataType: 'string', isDynamic: false, alias: 'Produto', order: 1 },
        { id: 'current_stock', dataSource: 'current_stock', dataType: 'number', isDynamic: false, alias: 'Estoque Atual', order: 2 },
        { id: 'unit_price', dataSource: 'unit_price', dataType: 'currency', isDynamic: false, alias: 'Preço Unit.', order: 3 },
        {
          id: 'total_value',
          dataSource: 'total_value',
          dataType: 'currency',
          isDynamic: true,
          alias: 'Valor Total 📐',
          order: 4,
          isReadOnly: true,
          expression: 'current_stock * unit_price',
        },
        {
          id: 'stock_status',
          dataSource: 'current_stock',
          dataType: 'custom',
          isDynamic: true,
          alias: 'Status Estoque 📐',
          order: 5,
          isReadOnly: true,
          expression: 'current_stock > 20 ? "ALTO" : current_stock > 5 ? "MÉDIO" : "BAIXO"',
        },
      ];
      const rowsStats: TableRow[] = [
        { id: 'stat1', product_name: 'Notebook Dell', current_stock: 5, unit_price: 3500 },
        { id: 'stat2', product_name: 'Mouse Logitech', current_stock: 25, unit_price: 85 },
        { id: 'stat3', product_name: 'Teclado Mecânico', current_stock: 15, unit_price: 450 },
        { id: 'stat4', product_name: 'Monitor LG 27"', current_stock: 8, unit_price: 1200 },
        { id: 'stat5', product_name: 'Webcam HD', current_stock: 35, unit_price: 200 },
      ];
      const statsConfig: TableConfig = {
        id: 'statistics_demo',
        name: 'Análise & Estatísticas',
        description: 'Tabela imaginária com cálculos dinâmicos (sem CRUD)',
        realEscope: false,
        rows: rowsStats,
        columns: columnsStats,
        trackHistory: false,
        allowDynamicColumns: true,
      };
      const statistics = new Table(statsConfig);
      tableRegistry.register(statistics, 'statistics_demo');
      registerHubTable({
        id: 'statistics_demo',
        label: 'Análise & Estatísticas',
        description: statsConfig.description,
        table: statistics,
        type: 'original',
        indexColumnId: 'product_name',
      });

      addLog('✨ Tabelas padrão registradas no hub!');
      setNewReferenceForm((prev) => ({
        ...prev,
        sourceId: 'products_demo',
      }));
    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [hubTables, buildBaseCallbacks, registerHubTable, addLog]);

  useEffect(() => {
    if (newReferenceForm.sourceId) {
      return;
    }
    const firstOriginal = Object.values(hubTables).find((meta) => meta.type === 'original');
    if (firstOriginal) {
      setNewReferenceForm((prev) => ({
        ...prev,
        sourceId: firstOriginal.id,
      }));
    }
  }, [hubTables, newReferenceForm.sourceId]);

  const lastReferenceSource = useRef<string | null>(null);
  useEffect(() => {
    if (!newReferenceForm.sourceId) return;
    const base = hubTables[newReferenceForm.sourceId];
    if (!base) return;
    if (lastReferenceSource.current !== newReferenceForm.sourceId || newReferenceForm.selectedColumns.length === 0) {
      lastReferenceSource.current = newReferenceForm.sourceId;
      setNewReferenceForm((prev) => ({
        ...prev,
        selectedColumns: base
          .table
          .getColumns()
          .map((col) => col.id)
          .filter((id) => id !== base.indexColumnId),
      }));
    }
  }, [newReferenceForm.sourceId, hubTables]);

  const activeMeta = activeTableId ? hubTables[activeTableId] : null;
  const activeTable = activeMeta?.table ?? placeholderTables.base;
  const activeApi = useTable(activeTable);

  const hubTableList = useMemo(() => Object.values(hubTables).sort((a, b) => a.label.localeCompare(b.label)), [hubTables]);
  const referenceBase = newReferenceForm.sourceId ? hubTables[newReferenceForm.sourceId] : undefined;
  const referenceColumns = referenceBase ? referenceBase.table.getColumns() : [];

  const toggleReferenceColumn = (columnId: string) => {
    setNewReferenceForm((prev) => {
      if (prev.selectedColumns.includes(columnId)) {
        return { ...prev, selectedColumns: prev.selectedColumns.filter((id) => id !== columnId) };
      }
      return { ...prev, selectedColumns: [...prev.selectedColumns, columnId] };
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-12">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">framework demo</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Tabelas minimalistas, com comportamento de planilha</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-500">
            Reordene colunas, use diálogos contextuais e edite células com fluidez — tudo inspirado nos forks mais limpos de Excel e Canva.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Filtros sempre prontos</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">1 clique</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Ordenação elegante</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">↕️ intuitiva</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Edição em linha</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">Duplo clique</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Snapshots & histórico</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">Salvos</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hub de tabelas</p>
                  <h3 className="text-2xl font-semibold text-slate-900">Gerencie originais, views e sandbox</h3>
                </div>
                {activeMeta && (
                  <button
                    onClick={() => setActiveTableId(null)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300"
                  >
                    Fechar atual
                  </button>
                )}
              </div>
              {hubTableList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500">
                  Nenhuma tabela registrada ainda. Use os formulários ao lado para criar uma original ou view referencial.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {hubTableList.map((meta) => (
                    <div key={meta.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
                          <p className="text-xs text-slate-500">
                            {meta.type === 'original' ? 'Original' : `Referência de ${meta.referenceSourceLabel || '—'}`}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Índice:&nbsp;<span className="font-mono">{meta.indexColumnId}</span>
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            meta.type === 'original' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          {meta.type === 'original' ? 'Original' : 'Referência'}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => setActiveTableId(meta.id)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            activeTableId === meta.id
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {activeTableId === meta.id ? 'Aberta' : 'Abrir'}
                        </button>
                        <button
                          onClick={() => removeHubTable(meta.id)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-slate-300"
                          disabled={hubTableList.length === 1}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <form onSubmit={handleCreateOriginal} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Nova tabela original</p>
                  <p className="text-xs text-slate-500">Defina um índice único e colunas iniciais.</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">Nome</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    value={newOriginalForm.name}
                    onChange={(e) => setNewOriginalForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex.: Inventário geral"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-slate-400">Índice</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      value={newOriginalForm.index}
                      onChange={(e) => setNewOriginalForm((prev) => ({ ...prev, index: e.target.value }))}
                      placeholder="codigo"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-slate-400">Colunas adicionais</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      value={newOriginalForm.columns}
                      onChange={(e) => setNewOriginalForm((prev) => ({ ...prev, columns: e.target.value }))}
                      placeholder="descricao,valor"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Criar tabela original
                </button>
              </form>

              <form onSubmit={handleCreateReference} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Nova tabela referencial</p>
                  <p className="text-xs text-slate-500">Selecione uma tabela guia e as colunas desejadas.</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">Tabela guia</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    value={newReferenceForm.sourceId}
                    onChange={(e) => setNewReferenceForm((prev) => ({ ...prev, sourceId: e.target.value, selectedColumns: [] }))}
                  >
                    <option value="">Selecione...</option>
                    {hubTableList
                      .filter((meta) => meta.type === 'original')
                      .map((meta) => (
                        <option key={meta.id} value={meta.id}>
                          {meta.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-400">Nome da view</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    value={newReferenceForm.name}
                    onChange={(e) => setNewReferenceForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex.: Estoque resumido"
                  />
                </div>
                {referenceBase ? (
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-white/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Colunas</p>
                    <div className="grid gap-2">
                      {referenceColumns.map((column) => {
                        const isIndex = column.id === referenceBase.indexColumnId;
                        return (
                          <label key={column.id} className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={isIndex || newReferenceForm.selectedColumns.includes(column.id)}
                              disabled={isIndex}
                              onChange={() => toggleReferenceColumn(column.id)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
                            />
                            <span>
                              {column.alias || column.dataSource}
                              {isIndex && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Índice</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500">
                    Selecione uma tabela original para listar as colunas disponíveis.
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
                  disabled={!newReferenceForm.sourceId}
                >
                  Criar tabela referencial
                </button>
              </form>
            </div>
          </div>
        </section>

        {activeMeta ? (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tabela ativa</p>
                  <h3 className="text-lg font-semibold text-slate-900">{activeMeta.label}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeMeta.type === 'original' && (
                    <button
                      onClick={() => syncReferenceRows(activeMeta.id)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300"
                    >
                      Sincronizar views
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTableId(null)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300"
                  >
                    Fechar visualização
                  </button>
                </div>
              </div>
            </div>
            <TablePanel
              table={activeTable}
              tableId={activeMeta.id}
              api={activeApi}
              columnOrder={columnOrder}
              defaultColumnOrder={defaultColumnOrder}
              setColumnOrder={setColumnOrder}
              snapshots={snapshots}
              setSnapshots={setSnapshots}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
              addLog={addLog}
              tableType={activeMeta.type}
              indexColumnId={activeMeta.indexColumnId}
              referenceSourceLabel={activeMeta.referenceSourceLabel}
            />
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
            Escolha uma tabela no hub acima para começar.
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Console de eventos</h2>
              <p className="text-sm text-slate-500">Toda interação registrada em tempo real.</p>
            </div>
            <button
              onClick={() => setOutput([])}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300"
            >
              Limpar log
            </button>
          </div>
          <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-slate-900/10 bg-slate-900 text-xs text-slate-100">
            {output.length === 0 ? (
              <div className="px-4 py-6 text-center text-slate-400">Aguardando eventos...</div>
            ) : (
              output.map((line, index) => (
                <div key={index} className="px-4 py-2 font-mono text-[11px]">
                  {line}
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="pb-4 text-center text-xs text-slate-500">
          <p>Table Render Framework · inspirado em planilhas minimalistas · pronto para conectar Supabase ou qualquer fonte.</p>
        </footer>
      </div>
    </div>
  );
}
