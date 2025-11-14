import React from 'react';
import { DataItem, EditingRowState } from '../types';

interface EditRowDialogProps<T extends DataItem> {
    editingRow: EditingRowState<T> | null;
    keys: string[];
    onFieldChange: (key: string, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

const EditRowDialog = <T extends DataItem>({ editingRow, keys, onFieldChange, onSave, onCancel }: EditRowDialogProps<T>) => {
    if (!editingRow) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }} onClick={onCancel}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(event) => event.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Linha</h3>
                <div className="space-y-3">
                    {keys.map((key) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                            <input
                                type="text"
                                value={String(editingRow.data[key] || '')}
                                onChange={(event) => onFieldChange(key, event.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onSave}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Salvar
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRowDialog;
