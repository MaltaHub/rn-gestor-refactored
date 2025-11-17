import React from 'react';
import Link from 'next/link';
import { DataItem } from '../types';

interface DataRowsProps<T extends DataItem> {
    data: T[];
    keys: string[];
    hoveredRow: string | number | null;
    onHoverRow: (rowId: string | number | null) => void;
    navigateTo?: { path: string; keyPath: keyof T };
    canEditRows: boolean;
    onRowMenuOpen: (event: React.MouseEvent, rowId: string | number) => void;
    onAddRowAfter: (position: number) => void;
}

const DataRows = <T extends DataItem>({
    data,
    keys,
    hoveredRow,
    onHoverRow,
    navigateTo,
    canEditRows,
    onRowMenuOpen,
    onAddRowAfter,
}: DataRowsProps<T>) => {
    return (
        <>
            {data.map((row, rowIndex) => (
                <div
                    key={row.id}
                    className="group relative flex transition-colors duration-150 hover:bg-gray-50"
                    onMouseEnter={() => onHoverRow(row.id)}
                    onMouseLeave={() => onHoverRow(null)}
                >
                    {canEditRows && (
                        <div className="relative w-6 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => onAddRowAfter(rowIndex)}
                                className="pointer-events-none absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-gray-300 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:text-blue-600 group-hover:hover:bg-blue-50"
                                aria-label={`Adicionar linha acima de ${row.id}`}
                                title="Adicionar linha"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {keys.map((key) => {
                        const cellContent = (
                            <div className="block w-full px-4 py-3 text-sm text-gray-800">{row[key]}</div>
                        );
                        return (
                            <div key={key} className="relative flex-1 border border-gray-200">
                                {navigateTo ? (
                                    <Link
                                        href={`${navigateTo.path}/${row[navigateTo.keyPath]}`}
                                        className="block h-full w-full"
                                    >
                                        {cellContent}
                                    </Link>
                                ) : (
                                    cellContent
                                )}
                            </div>
                        );
                    })}

                    {canEditRows && hoveredRow === row.id && (
                        <button
                            data-menu-trigger="true"
                            onClick={(event) => onRowMenuOpen(event, row.id)}
                            className="absolute right-1 top-1 z-10 rounded border border-gray-200 bg-white p-1 shadow-md transition-all duration-150 hover:bg-gray-50"
                            aria-label="Abrir menu da linha"
                        >
                            <svg className="h-3.5 w-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    )}
                </div>
            ))}
        </>
    );
};

export default DataRows;
