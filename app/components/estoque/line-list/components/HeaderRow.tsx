import React from 'react';
import { SortConfig } from '../types';

interface HeaderRowProps {
    keys: string[];
    draggedIndex: number | null;
    dragOverIndex: number | null;
    activeFilters: Record<string, string>;
    sortConfig: SortConfig | null;
    hoveredHeader: string | null;
    onHoverHeader: (key: string | null) => void;
    onDragStart: (index: number) => void;
    onDragOver: (event: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
    onDragLeave: () => void;
    onHeaderMenuClick: (event: React.MouseEvent, key: string) => void;
}

const HeaderRow: React.FC<HeaderRowProps> = ({
    keys,
    draggedIndex,
    dragOverIndex,
    activeFilters,
    sortConfig,
    hoveredHeader,
    onHoverHeader,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragLeave,
    onHeaderMenuClick,
}) => {
    return (
        <div className="flex bg-gray-50 font-semibold text-sm text-gray-700">
            {keys.map((key, index) => (
                <div
                    key={key}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(event) => onDragOver(event, index)}
                    onDragEnd={onDragEnd}
                    onDragLeave={onDragLeave}
                    onMouseEnter={() => onHoverHeader(key)}
                    onMouseLeave={() => onHoverHeader(null)}
                    className={`
                        flex-1 px-4 py-3 border border-gray-200
                        cursor-move select-none
                        transition-all duration-200
                        hover:bg-gray-100
                        relative
                        ${draggedIndex === index ? 'opacity-40' : 'opacity-100'}
                        ${dragOverIndex === index && draggedIndex !== index ? 'border-l-4 border-l-blue-500' : ''}
                    `}
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                        {key}
                        {activeFilters[key] && (
                            <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full" title="Filtro ativo"></span>
                        )}
                        {sortConfig?.key === key && (
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {sortConfig.direction === 'asc' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                )}
                            </svg>
                        )}
                    </div>

                    {hoveredHeader === key && (
                        <button
                            data-menu-trigger="true"
                            onClick={(event) => onHeaderMenuClick(event, key)}
                            className="absolute top-1 right-1 p-1 bg-white rounded shadow-md hover:bg-gray-50 transition-all duration-150 border border-gray-200"
                        >
                            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7 a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default HeaderRow;
