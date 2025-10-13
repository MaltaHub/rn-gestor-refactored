'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Edit2, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Modal, ModalContent, ModalFooter } from './ui/modal';

export interface Column<T> {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  editable?: boolean;
  align?: 'left' | 'center' | 'right';
  accessor?: (row: T) => unknown;
  comparator?: (a: T, b: T, direction: 'asc' | 'desc') => number;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  editRender?: (value: unknown, row: T, onChange: (value: unknown) => void) => React.ReactNode;
}

export interface RenderTablesProps<T> {
  data: T[];
  columns: Column<T>[];
  mode?: 'view' | 'edit';
  rowKey: keyof T | ((row: T) => string);
  onRowClick?: (row: T, index: number) => void;
  onRowEdit?: (row: T, index: number) => void;
  onRowDelete?: (row: T, index: number) => void;
  onCreate?: () => void;
  onUpdate?: (row: T, updates: Partial<T>) => Promise<void>;
  itemsPerPage?: number;
  enableVirtualization?: boolean;
  editModal?: {
    title?: string;
    renderForm: (row: T | null, onChange: (updates: Partial<T>) => void) => React.ReactNode;
  };
  className?: string;
  initialSort?: { key: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (sort: { key: string; direction: 'asc' | 'desc' } | null) => void;
  initialScroll?: number;
  onScrollChange?: (position: number) => void;
  initialColumnWidths?: Record<string, number>;
  onColumnWidthChange?: (key: string, width: number) => void;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function RenderTables<T extends Record<string, unknown>>({
  data,
  columns,
  mode = 'view',
  rowKey,
  onRowClick,
  onRowEdit,
  onRowDelete,
  onCreate,
  onUpdate,
  itemsPerPage = 10,
  enableVirtualization = true,
  editModal,
  className = '',
  initialSort,
  onSortChange,
  initialScroll,
  onScrollChange,
  initialColumnWidths,
  onColumnWidthChange,
}: RenderTablesProps<T>) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [internalSortConfig, setInternalSortConfig] = useState<SortConfig | null>(initialSort || null);
  const [internalColumnWidths, setInternalColumnWidths] = useState<Record<string, number>>(initialColumnWidths || {});
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: itemsPerPage });
  const [editingCell, setEditingCell] = useState<{ rowKey: string; columnKey: string } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});

  const sortConfig = onSortChange ? (initialSort || null) : internalSortConfig;
  const columnWidths = onColumnWidthChange ? (initialColumnWidths || {}) : internalColumnWidths;

  const getRowKey = useCallback(
    (row: T): string => {
      if (typeof rowKey === 'function') {
        return rowKey(row);
      }
      return String(row[rowKey]);
    },
    [rowKey]
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const column = columns.find((c) => c.key === sortConfig.key);
    
    const sorted = [...data].sort((a, b) => {
      if (column?.comparator) {
        return column.comparator(a, b, sortConfig.direction);
      }

      const aValue = column?.accessor ? column.accessor(a) : a[sortConfig.key];
      const bValue = column?.accessor ? column.accessor(b) : b[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const comparison = String(aValue).localeCompare(String(bValue), 'pt-BR');
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig, columns]);

  const visibleData = useMemo(() => {
    if (!enableVirtualization) return sortedData;
    return sortedData.slice(visibleRange.start, visibleRange.end);
  }, [sortedData, visibleRange, enableVirtualization]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    const updateSort = (prev: SortConfig | null): SortConfig | null => {
      if (prev?.key === columnKey) {
        return prev.direction === 'asc'
          ? { key: columnKey, direction: 'desc' as const }
          : null;
      }
      return { key: columnKey, direction: 'asc' as const };
    };

    if (onSortChange) {
      const newSort = updateSort(sortConfig);
      onSortChange(newSort);
    } else {
      setInternalSortConfig(updateSort);
    }
  };

  const handleScroll = useCallback(() => {
    if (!enableVirtualization || !tableRef.current) return;

    const { scrollTop, clientHeight } = tableRef.current;
    const rowHeight = 52;
    const buffer = 5;

    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const end = Math.min(
      sortedData.length,
      Math.ceil((scrollTop + clientHeight) / rowHeight) + buffer
    );

    setVisibleRange({ start, end });

    if (onScrollChange) {
      onScrollChange(scrollTop);
    }
  }, [enableVirtualization, sortedData.length, onScrollChange]);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (!tableElement || !enableVirtualization) return;

    tableElement.addEventListener('scroll', handleScroll);
    return () => tableElement.removeEventListener('scroll', handleScroll);
  }, [handleScroll, enableVirtualization]);

  useEffect(() => {
    if (initialScroll !== undefined && tableRef.current) {
      tableRef.current.scrollTop = initialScroll;
    }
  }, [initialScroll]);

  const handleColumnResize = (columnKey: string, deltaX: number) => {
    const column = columns.find((c) => c.key === columnKey);
    const currentWidth = columnWidths[columnKey] || column?.width || 150;
    const minWidth = column?.minWidth || 80;
    const newWidth = Math.max(minWidth, currentWidth + deltaX);
    
    if (onColumnWidthChange) {
      onColumnWidthChange(columnKey, newWidth);
    } else {
      setInternalColumnWidths((prev) => ({ ...prev, [columnKey]: newWidth }));
    }
  };

  const handleCellEdit = (rowKey: string, columnKey: string, value: unknown) => {
    const row = sortedData.find((r) => getRowKey(r) === rowKey);
    if (!row || !onUpdate) return;

    onUpdate(row, { [columnKey]: value } as Partial<T>);
    setEditingCell(null);
  };

  const handleOpenEditModal = (row: T) => {
    setEditingRow(row);
    setFormData(row);
    setEditModalOpen(true);
  };

  const handleSaveEditModal = async () => {
    if (!editingRow || !onUpdate) return;

    try {
      await onUpdate(editingRow, formData);
      setEditModalOpen(false);
      setEditingRow(null);
      setFormData({});
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getColumnWidth = (column: Column<T>) => {
    return columnWidths[column.key] || column.width || 150;
  };

  const rowHeight = 52;
  const paddingTop = enableVirtualization ? visibleRange.start * rowHeight : 0;
  const paddingBottom = enableVirtualization ? (sortedData.length - visibleRange.end) * rowHeight : 0;

  return (
    <div className={`flex flex-col ${className}`}>
      {mode === 'edit' && onCreate && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onCreate}
          >
            Adicionar
          </Button>
        </div>
      )}

      <div
        ref={tableRef}
        className="overflow-auto border border-[var(--border-default)] rounded-lg bg-white"
        style={{ maxHeight: '70vh' }}
      >
        <table className="w-full">
            <thead className="sticky top-0 z-10 bg-white border-b border-[var(--border-default)]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="group relative px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] select-none"
                    style={{
                      width: getColumnWidth(column),
                      minWidth: column.minWidth || 80,
                      textAlign: column.align || 'left',
                    }}
                  >
                    <div
                      className={`flex items-center gap-2 ${column.sortable ? 'cursor-pointer hover:text-[var(--purple-magic)]' : ''
                        }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      {column.label}
                      {column.sortable && getSortIcon(column.key)}
                    </div>

                    {mode === 'edit' && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--purple-magic)] opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;

                          const handleMouseMove = (moveEvent: MouseEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            handleColumnResize(column.key, deltaX);
                          };

                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };

                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      >
                        <GripVertical className="w-3 h-3 text-[var(--text-secondary)]" />
                      </div>
                    )}
                  </th>
                ))}

                {mode === 'edit' && (onRowEdit || onRowDelete) && (
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-primary)] w-32">
                    Ações
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {enableVirtualization && paddingTop > 0 && (
                <tr style={{ height: paddingTop }} aria-hidden="true">
                  <td colSpan={columns.length + (mode === 'edit' && (onRowEdit || onRowDelete) ? 1 : 0)} />
                </tr>
              )}
              
              {visibleData.map((row, index) => {
                const rKey = getRowKey(row);
                return (
                  <tr
                    key={rKey}
                    className="border-b border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {columns.map((column) => {
                      const value = row[column.key];
                      const isEditing =
                        mode === 'edit' &&
                        editingCell?.rowKey === rKey &&
                        editingCell?.columnKey === column.key;

                      return (
                        <td
                          key={column.key}
                          className="px-4 py-3 text-sm text-[var(--text-primary)]"
                          style={{
                            width: getColumnWidth(column),
                            textAlign: column.align || 'left',
                          }}
                          onClick={(e) => {
                            if (mode === 'edit' && column.editable) {
                              e.stopPropagation();
                              setEditingCell({ rowKey: rKey, columnKey: column.key });
                            }
                          }}
                        >
                          {isEditing && column.editRender ? (
                            column.editRender(value, row, (newValue) =>
                              handleCellEdit(rKey, column.key, newValue)
                            )
                          ) : column.render ? (
                            column.render(value, row, index)
                          ) : (
                            <span>{String(value ?? '—')}</span>
                          )}
                        </td>
                      );
                    })}

                    {mode === 'edit' && (onRowEdit || onRowDelete) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {onRowEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Edit2 className="w-4 h-4" />}
                              onClick={() => {
                                if (editModal) {
                                  handleOpenEditModal(row);
                                } else {
                                  onRowEdit(row, index);
                                }
                              }}
                            >
                              Editar
                            </Button>
                          )}
                          {onRowDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                              onClick={() => onRowDelete(row, index)}
                            >
                              Excluir
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              
              {enableVirtualization && paddingBottom > 0 && (
                <tr style={{ height: paddingBottom }} aria-hidden="true">
                  <td colSpan={columns.length + (mode === 'edit' && (onRowEdit || onRowDelete) ? 1 : 0)} />
                </tr>
              )}
            </tbody>
          </table>
      </div>

      {editModal && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingRow(null);
            setFormData({});
          }}
          title={editModal.title || 'Editar'}
          size="xl"
        >
          <ModalContent>
            {editModal.renderForm(editingRow, (updates) =>
              setFormData((prev) => ({ ...prev, ...updates }))
            )}
          </ModalContent>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setEditingRow(null);
                setFormData({});
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveEditModal}>
              Salvar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
