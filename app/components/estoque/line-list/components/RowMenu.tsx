import React from 'react';
import { RowMenuPosition } from '../types';

interface RowMenuProps {
    menu: RowMenuPosition | null;
    onEditRow: (rowId: string | number) => void;
    onDeleteRow: (rowId: string | number) => void;
    onCloseMenu: () => void;
}

const RowMenu: React.FC<RowMenuProps> = ({ menu, onEditRow, onDeleteRow, onCloseMenu }) => {
    if (!menu) {
        return null;
    }

    return (
        <div
            className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-1 min-w-[160px] animate-in fade-in zoom-in duration-100"
            style={{ left: `${menu.x + 8}px`, top: `${menu.y + 8}px`, zIndex: 9999 }}
            data-menu="true"
        >
            <button
                onClick={() => {
                    onEditRow(menu.rowId);
                    onCloseMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar linha
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
                onClick={() => {
                    onDeleteRow(menu.rowId);
                    onCloseMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir linha
            </button>
        </div>
    );
};

export default RowMenu;
