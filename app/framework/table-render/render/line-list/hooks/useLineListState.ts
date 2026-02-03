import React from 'react';
import { useTable } from '../../../useTableFramework';
import type { TableCellValue, TableColumn, TableFilter, TableRow } from '@/app/framework/table-render/types';
import { resolveRenderConfig, resolveRenderPermissions } from '../../config';
import type { RenderTableLabels } from '../../types';
import { createDragStore } from '../stores/useDragStore';
import { createFilterStore } from '../stores/useFilterStore';
import { createEditStore } from '../stores/useEditStore';
import { createMenuStore } from '../stores/useMenuStore';
import {
  DataItem,
  EditingRowState,
  FilterDialogState,
  LineListColumnMeta,
  LineListProps,
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

const buildHiddenColumnMeta = (columns: TableColumn[]): LineListColumnMeta[] =>
  [...columns]
    .filter((column) => column.isHidden)
    .sort((a, b) => a.order - b.order)
    .map((column) => ({
      column,
      label: column.alias || column.dataSource,
    }));

const isValidKeyPath = <T extends DataItem>(columns: LineListColumnMeta[], keyPath: keyof T): boolean => {
  if (keyPath === 'id') {
    return true;
  }
  return columns.some((meta) => meta.column.dataSource === keyPath);
};

type EditingCellState = {
  rowId: string | number;
  columnId: string;
  dataSource: string;
  dataType: TableColumn['dataType'];
  originalValue: TableCellValue;
};

interface UseLineListStateReturn<T extends DataItem> {
  data: T[];
  columns: LineListColumnMeta[];
  hiddenColumns: LineListColumnMeta[];
  labels: RenderTableLabels;
  canEditHeaders: boolean;
  canStructureEdit: boolean;
  allowColumnReorder: boolean;
  canEditRows: boolean;
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
  editingCell: { rowId: string | number; columnId: string } | null;
  editingValue: string;
  filteredAndSortedData: T[];
  invalidKeyPath: boolean;
  handleDragStart: (index: number) => void;
  handleDragOver: (event: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDragLeave: () => void;
  handleHeaderMenuOpen: (column: LineListColumnMeta, anchor: HTMLElement) => void;
  handleRowMenuOpen: (rowId: string | number, column: LineListColumnMeta, anchor: HTMLElement) => void;
  closeContextMenus: () => void;
  closeMenus: () => void;
  scheduleMenuClose: () => void;
  cancelMenuClose: () => void;
  handleSort: (columnId: string, direction: 'asc' | 'desc') => void;
  handleFilterOpen: (columnId: string, label: string, position: { x: number; y: number }) => void;
  handleFilterApply: () => void;
  handleFilterClear: (columnId: string) => void;
  handleFilterCancel: () => void;
  handleAddColumn: (options?: { position?: number; name?: string }) => void;
  handleRemoveColumn: (columnId: string) => void;
  handleRenameColumn: (columnId: string) => Promise<void>;
  handleHideColumn: (columnId: string) => Promise<void>;
  handleShowColumn: (columnId: string) => Promise<void>;
  handleAddRow: (options?: { position?: number }) => Promise<void>;
  handleEditRow: (rowId: string | number) => void;
  handleDuplicateRow: (rowId: string | number) => Promise<void>;
  handleSaveEdit: () => Promise<void>;
  handleCancelEdit: () => void;
  handleDeleteRow: (rowId: string | number) => Promise<void>;
  updateEditingRowField: (key: string, value: string) => void;
  handleCellEditStart: (rowId: string | number, column: LineListColumnMeta) => void;
  handleCellEditChange: (value: string) => void;
  handleCellEditCommit: () => Promise<void>;
  handleCellEditCancel: () => void;
  renderCell: (rowId: string | number, column: LineListColumnMeta) => React.ReactNode;
}

const createLineListStores = () => ({
  dragStore: createDragStore(),
  filterStore: createFilterStore(),
  editStore: createEditStore<DataItem>(),
  menuStore: createMenuStore(),
});

const useLineListState = <T extends DataItem>({
  table,
  navigateTo,
  onDataChange,
  mode = 'edit',
  config,
}: LineListProps<T>): UseLineListStateReturn<T> => {
  // @ts-expect-error - ITable é compatível com Table em runtime
  const tableApi = useTable(table);
  const resolvedConfig = React.useMemo(() => resolveRenderConfig(config), [config]);
  const permissions = React.useMemo(
    () => resolveRenderPermissions(table, mode, resolvedConfig),
    [table, mode, resolvedConfig]
  );
  const { dragStore, filterStore, editStore, menuStore } = React.useMemo(() => createLineListStores(), []);

  const columns = React.useMemo(() => buildColumnMeta(tableApi.columns), [tableApi.columns]);
  const hiddenColumns = React.useMemo(() => buildHiddenColumnMeta(tableApi.columns), [tableApi.columns]);
  const columnOrder = React.useMemo(() => columns.map((meta) => meta.column.id), [columns]);

  const data = React.useMemo(() => {
    const source = tableApi.visibleRows.length ? tableApi.visibleRows : tableApi.rows;
    return source as T[];
  }, [tableApi.visibleRows, tableApi.rows]);

  const activeFilters = React.useMemo(() => {
    const filters: Record<string, string> = {};
    tableApi.filters.forEach((filter) => {
      filters[filter.columnId] = String(filter.value ?? '');
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


  const { labels, interactions } = resolvedConfig;
  const notifyError = React.useCallback(
    (error: unknown) => {
      if (resolvedConfig.onError) {
        resolvedConfig.onError(error);
        return;
      }
      console.error(error);
    },
    [resolvedConfig]
  );

  const canStructureEdit = permissions.canStructureEdit;
  const canEditHeaders = permissions.canEditHeaders;
  const canEditRows = permissions.canEditRows;
  const allowColumnReorder = permissions.allowColumnReorder;

  const [editingCell, setEditingCell] = React.useState<EditingCellState | null>(null);
  const [editingValue, setEditingValue] = React.useState('');

  const isCellEditable = React.useCallback(
    (column: TableColumn) => canEditRows && !column.isDynamic && !column.isReadOnly,
    [canEditRows]
  );

  const resetCellEdit = React.useCallback(() => {
    setEditingCell(null);
    setEditingValue('');
  }, []);

  const parseCellValue = React.useCallback((rawValue: string, dataType: TableColumn['dataType']): TableCellValue => {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return '';
    }
    if (dataType === 'number' || dataType === 'currency') {
      const sanitized = trimmed.replace(/[^\d,.-]/g, '');
      const normalized = sanitized.replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
      const numeric = Number(normalized);
      return Number.isNaN(numeric) ? trimmed : numeric;
    }
    if (dataType === 'boolean') {
      const lower = trimmed.toLowerCase();
      if (['true', '1', 'sim', 'yes'].includes(lower)) {
        return true;
      }
      if (['false', '0', 'nao', 'no'].includes(lower)) {
        return false;
      }
    }
    return trimmed;
  }, []);

  const invalidKeyPath = React.useMemo(() => {
    if (!navigateTo) {
      return false;
    }
    return !isValidKeyPath(columns, navigateTo.keyPath as keyof T);
  }, [navigateTo, columns]);

  const menuCloseTimer = React.useRef<number | null>(null);

  const closeContextMenus = React.useCallback(() => {
    closeMenusStore();
  }, [closeMenusStore]);

  const closeMenus = React.useCallback(() => {
    closeContextMenus();
    closeFilterDialog();
  }, [closeContextMenus, closeFilterDialog]);

  const cancelMenuClose = React.useCallback(() => {
    if (menuCloseTimer.current) {
      window.clearTimeout(menuCloseTimer.current);
      menuCloseTimer.current = null;
    }
  }, []);

  const scheduleMenuClose = React.useCallback(() => {
    if (!headerMenu && !rowMenu && !filterDialog) {
      return;
    }
    cancelMenuClose();
    menuCloseTimer.current = window.setTimeout(() => {
      closeMenus();
      menuCloseTimer.current = null;
    }, 1000);
  }, [cancelMenuClose, closeMenus, filterDialog, headerMenu, rowMenu]);

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

  React.useEffect(() => {
    return () => cancelMenuClose();
  }, [cancelMenuClose]);

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
      resolvedConfig.onColumnOrderChange?.(newOrder);
    }
    resetDrag();
  };

  const handleDragLeave = () => {
    if (!allowColumnReorder) {
      return;
    }
    setDragOverIndex(null);
  };

  const getMenuAnchorPosition = (anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    return { x: rect.left, y: rect.bottom };
  };

  const handleHeaderMenuOpen = (column: LineListColumnMeta, anchor: HTMLElement) => {
    if (!canEditHeaders) {
      return;
    }
    cancelMenuClose();
    setRowMenu(null);
    const { x, y } = getMenuAnchorPosition(anchor);
    setHeaderMenu({ columnId: column.column.id, label: column.label, x, y });
  };

  const handleRowMenuOpen = (rowId: string | number, column: LineListColumnMeta, anchor: HTMLElement) => {
    if (!canEditRows) {
      return;
    }
    cancelMenuClose();
    setHeaderMenu(null);
    const { x, y } = getMenuAnchorPosition(anchor);
    setRowMenu({ rowId, columnId: column.column.id, x, y });
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
    cancelMenuClose();
    setFilterValue(activeFilters[columnId] || '');
    setFilterDialog({ columnId, label, x: position.x, y: position.y });
    closeContextMenus();
  };

  const handleFilterApply = () => {
    if (filterDialog) {
      const filter: TableFilter = {
        id: filterDialog.columnId,
        columnId: filterDialog.columnId,
        operator: resolvedConfig.filter.operator,
        value: filterValue,
        caseSensitive: resolvedConfig.filter.caseSensitive,
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
    const baseName = options?.name?.trim() || labels.newColumnName;
    const existingIds = new Set(columnOrder);
    const columnId = resolvedConfig.columnIdFactory(baseName, existingIds);
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
        let nextOrder = [...columnOrder, columnId];
        if (insertionIndex !== columnOrder.length) {
          nextOrder = [...columnOrder];
          nextOrder.splice(insertionIndex, 0, columnId);
          tableApi.setColumnOrder(nextOrder);
        }
        resolvedConfig.onColumnOrderChange?.(nextOrder);
        onDataChange?.(table.getRows() as T[]);
      })
      .catch((error) => {
        notifyError(error);
      });
  };

  const handleRemoveColumn = (columnId: string) => {
    if (!canStructureEdit) {
      return;
    }
    if (columns.length <= 1) {
      interactions.alert(labels.alertMinColumns);
      return;
    }
    const columnLabel = columns.find((meta) => meta.column.id === columnId)?.label || columnId;
    Promise.resolve(interactions.confirm(labels.confirmRemoveColumn(columnLabel)))
      .then((confirmed) => {
        if (!confirmed) {
          return;
        }
        tableApi
          .deleteColumn(columnId)
          .then(() => {
            onDataChange?.(table.getRows() as T[]);
          })
          .catch((error) => notifyError(error));
      })
      .catch((error) => notifyError(error));
  };

  const handleRenameColumn = async (columnId: string) => {
    if (!canStructureEdit) {
      return;
    }
    const columnLabel = columns.find((meta) => meta.column.id === columnId)?.label || columnId;
    const nextLabel = await Promise.resolve(interactions.prompt(labels.promptRenameColumn(columnLabel), columnLabel));
    const trimmed = nextLabel?.trim();
    if (!trimmed) {
      return;
    }
    try {
      await tableApi.renameColumn(columnId, trimmed);
    } catch (error) {
      notifyError(error);
    }
  };

  const handleHideColumn = async (columnId: string) => {
    if (!canStructureEdit) {
      return;
    }
    try {
      await tableApi.updateColumn(columnId, { isHidden: true });
    } catch (error) {
      notifyError(error);
    }
  };

  const handleShowColumn = async (columnId: string) => {
    if (!canStructureEdit) {
      return;
    }
    try {
      await tableApi.updateColumn(columnId, { isHidden: false });
    } catch (error) {
      notifyError(error);
    }
  };

  const buildEmptyRow = () => resolvedConfig.buildEmptyRow(columns.map((meta) => meta.column));

  const handleAddRow = async (options?: { position?: number }) => {
    if (!canEditRows) {
      interactions.alert(labels.alertReadOnly);
      return;
    }
    if (columns.length === 0) {
      interactions.alert(labels.alertNoColumns);
      return;
    }
    try {
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
    } catch (error) {
      notifyError(error);
    }
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

  const handleDuplicateRow = async (rowId: string | number) => {
    if (!canEditRows) {
      return;
    }
    const row = table.getRows().find((item) => String(item.id) === String(rowId));
    if (!row) {
      return;
    }
    const payload = { ...row };
    // @ts-ignore - remove id para criar nova linha
    delete payload.id;
    try {
      await tableApi.create(payload);
      onDataChange?.(table.getRows() as T[]);
    } catch (error) {
      notifyError(error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRow || !canEditRows) {
      return;
    }
    try {
      await tableApi.update(editingRow.rowId, editingRow.data as TableRow);
      onDataChange?.(table.getRows() as T[]);
      closeEditDialog();
    } catch (error) {
      notifyError(error);
    }
  };

  const handleCancelEdit = () => {
    closeEditDialog();
  };

  const handleDeleteRow = async (rowId: string | number) => {
    if (!canEditRows) {
      return;
    }
    if (table.getRows().length <= 1) {
      interactions.alert(labels.alertMinRows);
      return;
    }
    const confirmed = await Promise.resolve(interactions.confirm(labels.confirmDeleteRow(rowId)));
    if (!confirmed) {
      return;
    }
    try {
      await tableApi.delete(rowId);
      onDataChange?.(table.getRows() as T[]);
    } catch (error) {
      notifyError(error);
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

  const handleCellEditStart = React.useCallback(
    (rowId: string | number, columnMeta: LineListColumnMeta) => {
      if (!isCellEditable(columnMeta.column)) {
        return;
      }
      closeMenus();
      const value = getCellValue(rowId, columnMeta);
      setEditingCell({
        rowId,
        columnId: columnMeta.column.id,
        dataSource: columnMeta.column.dataSource,
        dataType: columnMeta.column.dataType,
        originalValue: value,
      });
      setEditingValue(value === null || value === undefined ? '' : String(value));
    },
    [closeMenus, getCellValue, isCellEditable]
  );

  const handleCellEditChange = React.useCallback((value: string) => {
    setEditingValue(value);
  }, []);

  const handleCellEditCommit = React.useCallback(async () => {
    if (!editingCell) {
      return;
    }
    if (!canEditRows) {
      resetCellEdit();
      return;
    }
    const nextValue = parseCellValue(editingValue, editingCell.dataType);
    if (nextValue === editingCell.originalValue) {
      resetCellEdit();
      return;
    }
    try {
      await tableApi.update(editingCell.rowId, { [editingCell.dataSource]: nextValue });
      onDataChange?.(table.getRows() as T[]);
    } catch (error) {
      notifyError(error);
      return;
    }
    resetCellEdit();
  }, [
    editingCell,
    editingValue,
    canEditRows,
    parseCellValue,
    resetCellEdit,
    tableApi,
    onDataChange,
    table,
    notifyError,
  ]);

  const handleCellEditCancel = React.useCallback(() => {
    resetCellEdit();
  }, [resetCellEdit]);

  const renderCell = React.useCallback(
    (rowId: string | number, columnMeta: LineListColumnMeta) => {
      const value = getCellValue(rowId, columnMeta);
      return resolvedConfig.formatValue({
        value,
        column: columnMeta.column,
        rowId,
        table,
      });
    },
    [getCellValue, resolvedConfig, table]
  );

  return {
    data,
    columns,
    hiddenColumns,
    labels,
    canEditHeaders,
    canStructureEdit,
    allowColumnReorder,
    canEditRows,
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
    editingCell: editingCell ? { rowId: editingCell.rowId, columnId: editingCell.columnId } : null,
    editingValue,
    filteredAndSortedData: data,
    invalidKeyPath,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragLeave,
    handleHeaderMenuOpen,
    handleRowMenuOpen,
    closeContextMenus,
    closeMenus,
    scheduleMenuClose,
    cancelMenuClose,
    handleSort,
    handleFilterOpen,
    handleFilterApply,
    handleFilterClear,
    handleFilterCancel,
    handleAddColumn,
    handleRemoveColumn,
    handleRenameColumn,
    handleHideColumn,
    handleShowColumn,
    handleAddRow,
    handleEditRow,
    handleDuplicateRow,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteRow,
    updateEditingRowField: handleUpdateEditingRowField,
    handleCellEditStart,
    handleCellEditChange,
    handleCellEditCommit,
    handleCellEditCancel,
    renderCell,
  };
};

export default useLineListState;
