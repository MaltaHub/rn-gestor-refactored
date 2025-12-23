import React from 'react';
import type { RenderTableLabels } from '../../types';
import { LineListColumnMeta, MenuPosition } from '../types';

interface HeaderMenuProps {
    menu: MenuPosition | null;
    activeFilters: Record<string, string>;
    labels: RenderTableLabels;
    hiddenColumns: LineListColumnMeta[];
    onSort: (key: string, direction: 'asc' | 'desc') => void;
    onFilterOpen: (columnId: string, label: string, position: { x: number; y: number }) => void;
    onFilterClear: (key: string) => void;
    onAddColumn: (options?: { position?: number; name?: string }) => void;
    onRemoveColumn: (key: string) => void;
    onRenameColumn: (key: string) => Promise<void>;
    onHideColumn: (key: string) => void;
    onShowColumn: (columnId: string) => void;
    onCloseMenu: () => void;
    canStructureEdit: boolean;
    onHoverStart: () => void;
    onHoverEnd: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({
    menu,
    activeFilters,
    labels,
    hiddenColumns,
    onSort,
    onFilterOpen,
    onFilterClear,
    onAddColumn,
    onRemoveColumn,
    onRenameColumn,
    onHideColumn,
    onShowColumn,
    onCloseMenu,
    canStructureEdit,
    onHoverStart,
    onHoverEnd,
}) => {
    if (!menu) {
        return null;
    }

    return (
        <div
            className="fixed rounded-xl border border-gray-200/80 bg-white/95 py-1 min-w-[190px] shadow-[0_12px_30px_-16px_rgba(15,23,42,0.45)] backdrop-blur-sm animate-in fade-in zoom-in duration-100"
            style={{ left: `${menu.x + 8}px`, top: `${menu.y + 8}px`, zIndex: 9999 }}
            data-menu="true"
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
        >
            <button
                onClick={() => {
                    onSort(menu.columnId, 'asc');
                    onCloseMenu();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100/80 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                {labels.sortAsc}
            </button>
            <button
                onClick={() => {
                    onSort(menu.columnId, 'desc');
                    onCloseMenu();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100/80 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                {labels.sortDesc}
            </button>
            <div className="my-1 border-t border-gray-200/70"></div>
            <button
                onClick={() => {
                    onFilterOpen(menu.columnId, menu.label, { x: menu.x, y: menu.y });
                    onCloseMenu();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100/80 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {labels.filter}
                {activeFilters[menu.columnId] && (
                    <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        {labels.filterActive}
                    </span>
                )}
            </button>
            {activeFilters[menu.columnId] && (
                <button
                    onClick={() => {
                        onFilterClear(menu.columnId);
                        onCloseMenu();
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100/80 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {labels.clearFilter}
                </button>
            )}
            {canStructureEdit && (
                <>
                    <button
                        onClick={() => {
                        onAddColumn();
                        onCloseMenu();
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100/80 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {labels.addColumn}
                </button>
                <div className="my-1 border-t border-gray-200/70"></div>
                <button
                    onClick={() => {
                        onRemoveColumn(menu.columnId);
                        onCloseMenu();
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {labels.removeColumn}
                </button>
                <button
                    onClick={() => {
                        onRenameColumn(menu.columnId).finally(onCloseMenu);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100/80 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z" />
                    </svg>
                    {labels.renameColumn}
                </button>
                    <button
                        onClick={() => {
                            onHideColumn(menu.columnId);
                            onCloseMenu();
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100/80 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.964 9.964 0 012.224-3.592m3.1-2.397A9.958 9.958 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.966 9.966 0 01-4.133 5.121M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 9L3 3" />
                        </svg>
                        {labels.hideColumn}
                    </button>
                    {hiddenColumns.length > 0 && (
                        <>
                            <div className="my-1 border-t border-gray-200/70"></div>
                            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                {labels.hiddenColumnsTitle}
                            </div>
                            <div className="max-h-40 overflow-auto px-1 pb-1">
                                {hiddenColumns.map((column) => (
                                    <button
                                        key={column.column.id}
                                        type="button"
                                        onClick={() => onShowColumn(column.column.id)}
                                        className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-100/80"
                                        aria-label={`${labels.showColumn} ${column.label}`}
                                    >
                                        <span className="truncate">{column.label}</span>
                                        <span className="text-[10px] font-semibold text-blue-600">
                                            {labels.showColumn}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default HeaderMenu;
