import React from 'react';
import Link from 'next/link';
import { DataItem } from '../types';

interface DataRowsProps<T extends DataItem> {
    data: T[];
    keys: string[];
    hoveredRow: string | number | null;
    onHoverRow: (rowId: string | number | null) => void;
    navigateTo?: { path: string; keyPath: keyof T };
    isReadOnly: boolean;
    onRowMenuOpen: (event: React.MouseEvent, rowId: string | number) => void;
}

const DataRows = <T extends DataItem>({
    data,
    keys,
    hoveredRow,
    onHoverRow,
    navigateTo,
    isReadOnly,
    onRowMenuOpen,
}: DataRowsProps<T>) => {
    return (
        <>
            {data.map((row) => (
                <div
                    key={row.id}
                    className="flex hover:bg-gray-50 transition-colors duration-150 relative group"
                    onMouseEnter={() => onHoverRow(row.id)}
                    onMouseLeave={() => onHoverRow(null)}
                >
                    <Link href={navigateTo ? `${navigateTo.path}/${row[navigateTo.keyPath]}` : '#'} className="flex flex-1">
                        {keys.map((key) => (
                            <div key={key} className="flex-1 px-4 py-3 border border-gray-200 text-sm text-gray-800">
                                {row[key]}
                            </div>
                        ))}
                    </Link>

                    {!isReadOnly && hoveredRow === row.id && (
                        <button
                            data-menu-trigger="true"
                            onClick={(event) => onRowMenuOpen(event, row.id)}
                            className="absolute top-1 right-1 p-1 bg-white rounded shadow-md hover:bg-gray-50 transition-all duration-150 border border-gray-200 z-10"
                        >
                            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
