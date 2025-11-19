import React from 'react';
import { useTable } from '@/app/framework/table-render';
import type { TableColumn, TableFilter, TableRow } from '@/app/framework/table-render/types';
import { createDragStore } from '@/app/stores/line-list/useDragStore';
import { createFilterStore } from '@/app/stores/line-list/useFilterStore';
import { createEditStore } from '@/app/stores/line-list/useEditStore';
import { createMenuStore } from '@/app/stores/line-list/useMenuStore';
import { createUIStore } from '@/app/stores/line-list/useUIStore';
import {
  DataItem,
  EditingRowState,
  FilterDialogState,
  LineCardsProps,
  LineListColumnMeta,
  MenuPosition,
  RowMenuPosition,
  SortConfig,
} from '../types';

const buildColumnMeta = (columns: TableColumn[]): LineListColumnMeta[] =>
  [...columns]
    .filter((column) => !column.isHidden)
    .sort((a, b) => a.order - b.order)
    .map((column) => ({
      column,
      label: column.alias || column.dataSource,
    }));

const sanitizeColumnId = (base: string, existing: Set<string>): string => {
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

const isValidKeyPath = <T extends DataItem>(columns: LineListColumnMeta[], keyPath: keyof T): boolean => {
  // 'id' is always a valid keyPath since it's a reserved field in DataItem
  if (keyPath === 'id') {
    return true;
  }
  return columns.some((meta) => meta.column.dataSource === keyPath);
};

interface UseLineListStateReturn<T extends DataItem> {
  data: T[];
  columns: LineListColumnMeta[];
  canEditHeaders: boolean;
  canStructureEdit: boolean;
  allowColumnReorder: boolean;
  canEditRows: boolean;
  hoveredHeader: string | null;
  setHoveredHeader: (key: string | null) => void;
  hoveredRow: string | number | null;
  setHoveredRow: (rowId: string | number | null) => void;
  dragState: {
    draggedIndex: number | null;
    dragOverIndex: number | null;
  };
  headerMenu: MenuPosition | null;
  rowMenu: RowMenuPosition | null;
  filterDialog: FilterDialogState | null;
  filterValue: string;
  setFilterValue: (value: string) => void;
  activeFilters: Record<string, string>;
  sortConfig: SortConfig | null;
  editingRow: EditingRowState<T> | null;
  filteredAndSortedData: T[];
  invalidKeyPath: boolean;
  isReadOnly: boolean;
  handleDragStart: (index: number) => void;
  handleDragOver: (event: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDragLeave: () => void;
  handleHeaderMenuOpen: (event: React.MouseEvent, column: LineListColumnMeta) => void;
  handleRowMenuOpen: (event: React.MouseEvent, rowId: string | number) => void;
  closeContextMenus: () => void;
  closeMenus: () => void;
  handleSort: (columnId: string, direction: 'asc' | 'desc') => void;
  handleFilterOpen: (columnId: string, label: string, position: { x: number; y: number }) => void;
  handleFilterApply: () => void;
  handleFilterClear: (columnId: string) => void;
  handleFilterCancel: () => void;
  handleAddColumn: (options?: { position?: number; name?: string }) => void;
  handleRemoveColumn: (columnId: string) => void;
  handleRenameColumn: (columnId: string, nextLabel: string) => Promise<boolean>;
  handleAddRow: (options?: { position?: number }) => Promise<void>;
  handleEditRow: (rowId: string | number) => void;
  handleSaveEdit: () => Promise<void>;
  handleCancelEdit: () => void;
  handleDeleteRow: (rowId: string | number) => Promise<void>;
  updateEditingRowField: (key: string, value: string) => void;
  getCellValue: (rowId: string | number, column: LineListColumnMeta) => any;
}

const createLineListStores = () => ({
  dragStore: createDragStore(),
  filterStore: createFilterStore(),
  editStore: createEditStore<DataItem>(),
  menuStore: createMenuStore(),
  uiStore: createUIStore(),
});

const useLineListState = <T extends DataItem>({ table, navigateTo, onDataChange, mode = 'edit' }: LineCardsProps<T>): UseLineListStateReturn<T> => {
  const tableApi = useTable(table);
  const { dragStore, filterStore, editStore, menuStore, uiStore } = React.useMemo(() => createLineListStores(), []);

  const columns = React.useMemo(() => buildColumnMeta(tableApi.columns), [tableApi.columns]);
  const columnOrder = React.useMemo(() => columns.map((meta) => meta.column.id), [columns]);

  const data = React.useMemo(() => {
    const source = tableApi.visibleRows.length ? tableApi.visibleRows : tableApi.rows;
    return source as T[];
  }, [tableApi.visibleRows, tableApi.rows]);

  const activeFilters = React.useMemo(() => {
    const filters: Record<string, string> = {};
    tableApi.filters.forEach((filter) => {
      if (filter.operator === 'contains') {
        filters[filter.columnId] = String(filter.value ?? '');
      }
    });
    return filters;
  }, [tableApi.filters]);

  const sortConfig = React.useMemo(() => {
    const sort = tableApi.sorts[0];
    return sort ? { key: sort.columnId, direction: sort.direction } : null;
  }, [tableApi.sorts]);

  const draggedIndex = dragStore((state) => state.draggedIndex);
  const dragOverIndex = dragStore((state) => state.dragOverIndex);
  const setDraggedIndex = dragStore((state) => state.setDraggedIndex);
  const setDragOverIndex = dragStore((state) => state.setDragOverIndex);
  const resetDrag = dragStore((state) => state.resetDrag);

  const filterDialog = filterStore((state) => state.filterDialog);
  const filterValue = filterStore((state) => state.filterValue);
  const setFilterDialog = filterStore((state) => state.setFilterDialog);
  const setFilterValue = filterStore((state) => state.setFilterValue);
  const closeFilterDialog = filterStore((state) => state.closeFilterDialog);

  const editingRow = editStore((state) => state.editingRow);
  const setEditingRow = editStore((state) => state.setEditingRow);
  const updateEditingRowFieldInStore = editStore((state) => state.updateEditingRowField);
  const closeEditDialog = editStore((state) => state.closeEditDialog);

  const headerMenu = menuStore((state) => state.headerMenu);
  const rowMenu = menuStore((state) => state.rowMenu);
  const setHeaderMenu = menuStore((state) => state.setHeaderMenu);
  const setRowMenu = menuStore((state) => state.setRowMenu);
  const closeMenusStore = menuStore((state) => state.closeContextMenus);

  const hoveredHeader = uiStore((state) => state.hoveredHeader);
  const hoveredRow = uiStore((state) => state.hoveredRow);
  const setHoveredHeader = uiStore((state) => state.setHoveredHeader);
  const setHoveredRow = uiStore((state) => state.setHoveredRow);

  const isReadOnly = mode === 'read-only';
  const canStructureEdit = mode === 'edit';
  const canEditHeaders = mode !== 'read-only';
  const canEditRows = mode !== 'read-only' && table.realEscope;
  const allowColumnReorder = mode === 'edit';

  const invalidKeyPath = React.useMemo(() => {
    if (!navigateTo) {
      return false;
    }
    return !isValidKeyPath(columns, navigateTo.keyPath as keyof T);
  }, [navigateTo, columns]);

  const closeContextMenus = React.useCallback(() => {
    closeMenusStore();
  }, [closeMenusStore]);

  const closeMenus = React.useCallback(() => {
    closeContextMenus();
    closeFilterDialog();
  }, [closeContextMenus, closeFilterDialog]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-menu]') || target.closest('[data-menu-trigger]')) {
        return;
      }
      closeContextMenus();
      closeFilterDialog();
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [closeContextMenus, closeFilterDialog]);

  const handleDragStart = (index: number) => {
    if (!allowColumnReorder) {
      return;
    }
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    if (!allowColumnReorder) {
      return;
    }
    event.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (!allowColumnReorder) {
      return;
    }
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newOrder = [...columnOrder];
      const [moved] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(dragOverIndex, 0, moved);
      tableApi.setColumnOrder(newOrder);
    }
    resetDrag();
  };

  const handleDragLeave = () => {
    if (!allowColumnReorder) {
      return;
    }
    setDragOverIndex(null);
  };

  const handleHeaderMenuOpen = (event: React.MouseEvent, column: LineListColumnMeta) => {
    if (!canStructureEdit) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    setHeaderMenu({ columnId: column.column.id, label: column.label, x: event.clientX, y: event.clientY });
  };

  const handleRowMenuOpen = (event: React.MouseEvent, rowId: string | number) => {
    if (!canEditRows) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setRowMenu({ rowId, x: event.clientX, y: event.clientY });
  };

  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    if (!canEditHeaders) {
      return;
    }
    tableApi.applySort([{ columnId, direction }]);
  };

  const handleFilterOpen = (columnId: string, label: string, position: { x: number; y: number }) => {
    if (!canEditHeaders) {
      return;
    }
    setFilterValue(activeFilters[columnId] || '');
    setFilterDialog({ columnId, label, x: position.x, y: position.y });
    closeContextMenus();
  };

  const handleFilterApply = () => {
    if (filterDialog) {
      const filter: TableFilter = {
        id: filterDialog.columnId,
        columnId: filterDialog.columnId,
        operator: 'contains',
        value: filterValue,
        caseSensitive: false,
      };
      tableApi.applyFilter(filter);
    }
    closeFilterDialog();
  };

  const handleFilterClear = (columnId: string) => {
    tableApi.clearFilter(columnId);
  };

  const handleFilterCancel = () => {
    closeFilterDialog();
  };

  const handleAddColumn = (options?: { position?: number; name?: string }) => {
    if (!canStructureEdit) {
      return;
    }
    const baseName = options?.name?.trim() || 'Nova Coluna';
    const existingIds = new Set(columnOrder);
    const columnId = sanitizeColumnId(baseName, existingIds);
    const insertionIndex = Math.max(0, Math.min(options?.position ?? columnOrder.length, columnOrder.length));

    const columnConfig: TableColumn = {
      id: columnId,
      alias: baseName,
      dataSource: columnId,
      dataType: 'string',
      isDynamic: false,
      order: insertionIndex,
      isFilterable: true,
      isSortable: true,
    };

    tableApi
      .addColumn(columnConfig, { fillValue: '' })
      .then(() => {
        if (insertionIndex !== columnOrder.length) {
          const newOrder = [...columnOrder];
          newOrder.splice(insertionIndex, 0, columnId);
          tableApi.setColumnOrder(newOrder);
        }
        onDataChange?.(table.getRows() as T[]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleRemoveColumn = (columnId: string) => {
    if (!canStructureEdit) {
      return;
    }
    if (columns.length <= 1) {
      alert('A tabela precisa ter pelo menos uma coluna.');
      return;
    }
    if (confirm('Remover esta coluna?')) {
      tableApi
        .deleteColumn(columnId)
        .then(() => {
          onDataChange?.(table.getRows() as T[]);
        })
        .catch((error) => console.error(error));
    }
  };

  const handleRenameColumn = async (columnId: string, nextLabel: string) => {
    if (!canStructureEdit) {
      return false;
    }
    const trimmed = nextLabel.trim();
    if (!trimmed.length) {
      return false;
    }
    await tableApi.renameColumn(columnId, trimmed);
    return true;
  };

  const buildEmptyRow = () => {
    return columns.reduce<Record<string, any>>((acc, meta) => {
      if (!meta.column.isDynamic) {
        acc[meta.column.dataSource] = '';
      }
      return acc;
    }, {});
  };

  const handleAddRow = async (options?: { position?: number }) => {
    if (!canEditRows) {
      alert('Esta tabela não permite operações de dados.');
      return;
    }
    if (columns.length === 0) {
      alert('Adicione ao menos uma coluna antes de criar linhas.');
      return;
    }
    const payload = buildEmptyRow();
    const newRowId = await tableApi.create(payload);
    const position = Math.max(0, Math.min(options?.position ?? data.length, data.length));
    if (position !== data.length) {
      const rows = [...table.getRows()];
      const index = rows.findIndex((row) => row.id === newRowId);
      if (index > -1) {
        const [row] = rows.splice(index, 1);
        rows.splice(position, 0, row);
        tableApi.setRows(rows as TableRow[]);
      }
    }
    onDataChange?.(table.getRows() as T[]);
  };

  const handleEditRow = (rowId: string | number) => {
    if (!canEditRows) {
      return;
    }
    const row = data.find((r) => r.id === rowId);
    if (row) {
      setEditingRow({ rowId, data: row });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRow || !canEditRows) {
      return;
    }
    await tableApi.update(editingRow.rowId, editingRow.data as TableRow);
    onDataChange?.(table.getRows() as T[]);
    closeEditDialog();
  };

  const handleCancelEdit = () => {
    closeEditDialog();
  };

  const handleDeleteRow = async (rowId: string | number) => {
    if (!canEditRows) {
      return;
    }
    if (table.getRows().length <= 1) {
      alert('A tabela precisa manter ao menos uma linha.');
      return;
    }
    if (confirm('Excluir esta linha?')) {
      await tableApi.delete(rowId);
      onDataChange?.(table.getRows() as T[]);
    }
  };

  const handleUpdateEditingRowField = (key: string, value: string) => {
    updateEditingRowFieldInStore(key, value);
  };

  const getCellValue = React.useCallback(
    (rowId: string | number, columnMeta: LineListColumnMeta) => {
      if (columnMeta.column.isDynamic) {
        return tableApi.getValue(rowId, columnMeta.column.id);
      }
      const row = data.find((r) => r.id === rowId);
      return row ? row[columnMeta.column.dataSource] : '';
    },
    [data, tableApi]
  );

  return {
    data,
    columns,
    canEditHeaders,
    canStructureEdit,
    allowColumnReorder,
    canEditRows,
    hoveredHeader,
    setHoveredHeader,
    hoveredRow,
    setHoveredRow,
    dragState: {
      draggedIndex,
      dragOverIndex,
    },
    headerMenu,
    rowMenu,
    filterDialog,
    filterValue,
    setFilterValue,
    activeFilters,
    sortConfig,
    editingRow: editingRow as EditingRowState<T> | null,
    filteredAndSortedData: data,
    invalidKeyPath,
    isReadOnly,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragLeave,
    handleHeaderMenuOpen,
    handleRowMenuOpen,
    closeContextMenus,
    closeMenus,
    handleSort,
    handleFilterOpen,
    handleFilterApply,
    handleFilterClear,
    handleFilterCancel,
    handleAddColumn,
    handleRemoveColumn,
    handleRenameColumn,
    handleAddRow,
    handleEditRow,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteRow,
    updateEditingRowField: handleUpdateEditingRowField,
    getCellValue,
  };
};

export default useLineListState;
