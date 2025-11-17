import React from 'react';
import { SortConfig } from '../types';

interface HeaderRowProps {
    keys: string[];
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
    onHeaderMenuClick: (event: React.MouseEvent, key: string) => void;
    onAddColumnAfter: (position: number) => string | null;
    onRenameColumn: (currentKey: string, nextKey: string) => boolean;
}

const HeaderRow: React.FC<HeaderRowProps> = ({
    keys,
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
    onRenameColumn,
}) => {
    const [editingKey, setEditingKey] = React.useState<string | null>(null);
    const [editingValue, setEditingValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        if (editingKey && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingKey]);

    const startEditing = React.useCallback((key: string, preset?: string) => {
        setEditingKey(key);
        setEditingValue(preset ?? key);
    }, []);

    const commitRename = React.useCallback(() => {
        if (!editingKey) {
            return;
        }
        const success = onRenameColumn(editingKey, editingValue);
        if (success) {
            setEditingKey(null);
            setEditingValue('');
        }
    }, [editingKey, editingValue, onRenameColumn]);

    const cancelRename = React.useCallback(() => {
        setEditingKey(null);
        setEditingValue('');
    }, []);

    const handleAddColumn = (position: number) => {
        const insertedKey = onAddColumnAfter(position);
        if (insertedKey) {
            startEditing(insertedKey, insertedKey);
        }
    };

    return (
        <div className="flex bg-gray-50 font-semibold text-sm text-gray-700">
            {keys.map((key, index) => {
                const isEditing = editingKey === key;
                const showHoverState = canStructureEdit && hoveredHeader === key;
                return (
                    <div
                        key={key}
                        draggable={allowColumnReorder && !isEditing}
                        onDragStart={allowColumnReorder && !isEditing ? () => onDragStart(index) : undefined}
                        onDragOver={allowColumnReorder && !isEditing ? (event) => onDragOver(event, index) : undefined}
                        onDragEnd={allowColumnReorder ? onDragEnd : undefined}
                        onDragLeave={allowColumnReorder ? onDragLeave : undefined}
                        onMouseEnter={canStructureEdit ? () => onHoverHeader(key) : undefined}
                        onMouseLeave={canStructureEdit ? () => onHoverHeader(null) : undefined}
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
                            {isEditing ? (
                                <input
                                    ref={inputRef}
                                    value={editingValue}
                                    onChange={(event) => setEditingValue(event.target.value)}
                                    onBlur={commitRename}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            commitRename();
                                        }
                                        if (event.key === 'Escape') {
                                            cancelRename();
                                        }
                                    }}
                                    className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            ) : (
                                <span className="truncate" onDoubleClick={() => canStructureEdit && startEditing(key)}>
                                    {key}
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

                        {canStructureEdit && (
                            <>
                                {showHoverState && (
                                    <button
                                        data-menu-trigger="true"
                                        onClick={(event) => onHeaderMenuClick(event, key)}
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
                                        startEditing(key);
                                    }}
                                    className="pointer-events-none absolute left-1 top-1 rounded-full border border-transparent bg-transparent p-1 text-gray-400 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 hover:text-gray-700"
                                    aria-label={`Renomear coluna ${key}`}
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleAddColumn(index + 1);
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
