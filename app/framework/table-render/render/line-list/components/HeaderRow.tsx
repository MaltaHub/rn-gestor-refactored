import React from 'react';
import type { RenderTableLabels } from '../../types';
import { LineListColumnMeta, SortConfig } from '../types';

interface HeaderRowProps {
    columns: LineListColumnMeta[];
    draggedIndex: number | null;
    dragOverIndex: number | null;
    activeFilters: Record<string, string>;
    sortConfig: SortConfig | null;
    activeMenuColumnId: string | null;
    canEditHeaders: boolean;
    canStructureEdit: boolean;
    allowColumnReorder: boolean;
    canEditRows: boolean;
    labels: RenderTableLabels;
    onDragStart: (index: number) => void;
    onDragOver: (event: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
    onDragLeave: () => void;
    onMenuOpen: (column: LineListColumnMeta, anchor: HTMLElement) => void;
    onMenuCloseDelay: () => void;
    onMenuCloseCancel: () => void;
    onAddColumnAfter: (position: number) => void;
}

const HeaderRow: React.FC<HeaderRowProps> = ({
    columns,
    draggedIndex,
    dragOverIndex,
    activeFilters,
    sortConfig,
    activeMenuColumnId,
    canEditHeaders,
    canStructureEdit,
    allowColumnReorder,
    canEditRows,
    labels,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragLeave,
    onMenuOpen,
    onMenuCloseDelay,
    onMenuCloseCancel,
    onAddColumnAfter,
}) => {
    const openTimer = React.useRef<number | null>(null);

    React.useEffect(() => {
        return () => {
            if (openTimer.current) {
                window.clearTimeout(openTimer.current);
                openTimer.current = null;
            }
        };
    }, []);

    const clearOpenTimer = () => {
        if (openTimer.current) {
            window.clearTimeout(openTimer.current);
            openTimer.current = null;
        }
    };

    const scheduleMenuOpen = (column: LineListColumnMeta, anchor: HTMLElement) => {
        if (!canEditHeaders) {
            return;
        }
        clearOpenTimer();
        openTimer.current = window.setTimeout(() => {
            onMenuOpen(column, anchor);
            openTimer.current = null;
        }, 2000);
    };

    const handleMouseEnter = (event: React.MouseEvent, column: LineListColumnMeta) => {
        if (!canEditHeaders) {
            return;
        }
        if (activeMenuColumnId === column.column.id) {
            onMenuCloseCancel();
        }
        scheduleMenuOpen(column, event.currentTarget as HTMLElement);
    };

    const handleMouseLeave = () => {
        clearOpenTimer();
        onMenuCloseDelay();
    };

    return (
        <div className="flex bg-gray-50 font-semibold text-sm text-gray-700">
            {canEditRows && <div className="w-6 flex-shrink-0" aria-hidden="true" />}
            {columns.map((meta, index) => {
                const key = meta.column.id;
                const label = meta.label;
                return (
                    <div
                        key={key}
                        draggable={allowColumnReorder}
                        onDragStart={allowColumnReorder ? () => onDragStart(index) : undefined}
                        onDragOver={allowColumnReorder ? (event) => onDragOver(event, index) : undefined}
                        onDragEnd={allowColumnReorder ? onDragEnd : undefined}
                        onDragLeave={allowColumnReorder ? onDragLeave : undefined}
                        onMouseEnter={(event) => handleMouseEnter(event, meta)}
                        onMouseLeave={handleMouseLeave}
                        className={`group relative flex-1 min-w-0 border border-gray-200 px-4 py-3 select-none transition-all duration-200 ${
                            allowColumnReorder ? 'cursor-move hover:bg-gray-100' : 'cursor-default'
                        } ${draggedIndex === index ? 'opacity-40' : 'opacity-100'} ${
                            dragOverIndex === index && draggedIndex !== index ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                    >
                        <div className="flex min-w-0 items-center gap-2 pr-10">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                            <span className={`truncate ${meta.column.isDynamic ? 'text-orange-600' : ''}`}>
                                {label}
                            </span>
                            {meta.column.isDynamic && (
                                <span className="text-[10px] uppercase tracking-wide text-orange-500">
                                    {labels.dynamicColumnBadge}
                                </span>
                            )}
                            {activeFilters[key] && (
                                <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" title="Filtro ativo"></span>
                            )}
                            {sortConfig?.key === key && (
                                <svg className="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {sortConfig.direction === 'asc' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    )}
                                </svg>
                            )}
                        </div>

                        {canEditHeaders && canStructureEdit && (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onAddColumnAfter(index + 1);
                                }}
                                className="pointer-events-none absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 opacity-0 shadow group-hover:pointer-events-auto group-hover:opacity-100"
                                aria-label={labels.addColumnAfter(label)}
                            >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default HeaderRow;
