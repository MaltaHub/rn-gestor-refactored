import React from 'react';
import { MenuPosition } from '../types';

interface HeaderMenuProps {
    menu: MenuPosition | null;
    activeFilters: Record<string, string>;
    onSort: (key: string, direction: 'asc' | 'desc') => void;
    onFilterOpen: (key: string, position: { x: number; y: number }) => void;
    onFilterClear: (key: string) => void;
    onAddColumn: (options?: { position?: number; name?: string }) => string | null;
    onRemoveColumn: (key: string) => void;
    onCloseMenu: () => void;
    canStructureEdit: boolean;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({
    menu,
    activeFilters,
    onSort,
    onFilterOpen,
    onFilterClear,
    onAddColumn,
    onRemoveColumn,
    onCloseMenu,
    canStructureEdit,
}) => {
    if (!menu) {
        return null;
    }

    return (
        <div
            className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[180px] animate-in fade-in zoom-in duration-100"
            style={{ left: `${menu.x + 8}px`, top: `${menu.y + 8}px`, zIndex: 9999 }}
            data-menu="true"
        >
            <button
                onClick={() => {
                    onSort(menu.key, 'asc');
                    onCloseMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Ordenar A→Z
            </button>
            <button
                onClick={() => {
                    onSort(menu.key, 'desc');
                    onCloseMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Ordenar Z→A
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
                onClick={() => {
                    onFilterOpen(menu.key, { x: menu.x, y: menu.y });
                    onCloseMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtrar
                {activeFilters[menu.key] && (
                    <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Ativo</span>
                )}
            </button>
            {activeFilters[menu.key] && (
                <button
                    onClick={() => {
                        onFilterClear(menu.key);
                        onCloseMenu();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpar filtro
                </button>
            )}
            {canStructureEdit && (
                <>
                    <button
                        onClick={() => {
                            onAddColumn();
                            onCloseMenu();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Adicionar coluna
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                        onClick={() => {
                            onRemoveColumn(menu.key);
                            onCloseMenu();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remover coluna
                    </button>
                </>
            )}
        </div>
    );
};

export default HeaderMenu;
