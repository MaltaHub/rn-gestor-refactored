import React from 'react';
import { FilterDialogState } from '../types';

interface FilterDialogProps {
    dialog: FilterDialogState | null;
    value: string;
    onChange: (value: string) => void;
    onApply: () => void;
    onCancel: () => void;
}

const FilterDialog: React.FC<FilterDialogProps> = ({ dialog, value, onChange, onApply, onCancel }) => {
    if (!dialog) {
        return null;
    }

    return (
        <div
            className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[220px] animate-in fade-in zoom-in duration-100"
            style={{ left: `${dialog.x + 8}px`, top: `${dialog.y + 8}px`, zIndex: 9999 }}
            data-menu="true"
        >
            <div className="text-sm font-semibold text-gray-700 mb-2">Filtrar: {dialog.key}</div>
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Digite para filtrar..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
            />
            <div className="flex gap-2 mt-3">
                <button
                    onClick={onApply}
                    className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                    Aplicar
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default FilterDialog;
