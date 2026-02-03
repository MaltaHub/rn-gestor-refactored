import React from 'react';
import type { LineListColumnMeta, SortConfig } from '@/src/domains/linelist/domain/types';

interface HeaderRowProps {
    columns: LineListColumnMeta[];
    draggedIndex: number | null;
    dragOverIndex: number | null;
    activeFilters: Record<string, string>;
    sortConfig: SortConfig | null;
    hoveredHeader: string | null;
    canStructureEdit: boolean;
    allowColumnReorder: boolean;
    onHoverHeader: (key: string | null) => void;
    onDragStart: (index: number) => void;
    onDragOver: (event: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
    onDragLeave: () => void;
    onHeaderMenuClick: (event: React.MouseEvent, column: LineListColumnMeta) => void;
    onAddColumnAfter: (position: number) => void;
}

const HeaderRow: React.FC<HeaderRowProps> = ({
    columns,
    draggedIndex,
    dragOverIndex,
    activeFilters,
    sortConfig,
    hoveredHeader,
    canStructureEdit,
    allowColumnReorder,
    onHoverHeader,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragLeave,
    onHeaderMenuClick,
    onAddColumnAfter,
}) => {
    const hoverTimer = React.useRef<number | null>(null);

    React.useEffect(() => {
        return () => {
            if (hoverTimer.current) {
                window.clearTimeout(hoverTimer.current);
                hoverTimer.current = null;
            }
        };
    }, []);

    const handleDelayedHoverEnter = (key: string) => {
        if (hoverTimer.current) {
            window.clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
        }
        hoverTimer.current = window.setTimeout(() => {
            onHoverHeader(key);
            hoverTimer.current = null;
        }, 2000);
    };

    const handleDelayedHoverLeave = () => {
        if (hoverTimer.current) {
            window.clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
        }
        onHoverHeader(null);
    };

    return (
        <div className="flex bg-gray-50 font-semibold text-sm text-gray-700">
            {columns.map((meta, index) => {
                const key = meta.column.id;
                const label = meta.label;
                const showHoverState = canStructureEdit && hoveredHeader === key;
                return (
                    <div
                        key={key}
                        draggable={allowColumnReorder}
                        onDragStart={allowColumnReorder ? () => onDragStart(index) : undefined}
                        onDragOver={allowColumnReorder ? (event) => onDragOver(event, index) : undefined}
                        onDragEnd={allowColumnReorder ? onDragEnd : undefined}
                        onDragLeave={allowColumnReorder ? onDragLeave : undefined}
                        onMouseEnter={canStructureEdit ? () => handleDelayedHoverEnter(key) : undefined}
                        onMouseLeave={canStructureEdit ? () => handleDelayedHoverLeave() : undefined}
                        className={`group relative flex-1 border border-gray-200 px-4 py-3 select-none transition-all duration-200 ${
                            allowColumnReorder ? 'cursor-move hover:bg-gray-100' : 'cursor-default'
                        } ${draggedIndex === index ? 'opacity-40' : 'opacity-100'} ${
                            dragOverIndex === index && draggedIndex !== index ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                    >
                        <div className="flex items-center gap-2 pr-10">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                            <span className={`truncate ${meta.column.isDynamic ? 'text-orange-600' : ''}`}>
                                {label}
                            </span>
                            {meta.column.isDynamic && (
                                <span className="text-[10px] uppercase tracking-wide text-orange-500">dinâmico</span>
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

                        {canStructureEdit && (
                            <>
                                {showHoverState && (
                                    <button
                                        data-menu-trigger="true"
                                        onClick={(event) => onHeaderMenuClick(event, meta)}
                                        className="absolute right-1 top-1 rounded border border-gray-200 bg-white p-1 shadow-md transition-all duration-150 hover:bg-gray-50"
                                    >
                                        <svg className="h-3.5 w-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                            />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onAddColumnAfter(index + 1);
                                    }}
                                    className="pointer-events-none absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 opacity-0 shadow group-hover:pointer-events-auto group-hover:opacity-100"
                                    aria-label={`Adicionar coluna após ${key}`}
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default HeaderRow;
