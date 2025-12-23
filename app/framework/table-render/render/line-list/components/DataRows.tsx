import React from 'react';
import Link from 'next/link';
import type { RenderTableLabels } from '../../types';
import { DataItem, LineListColumnMeta } from '../types';

interface DataRowsProps<T extends DataItem> {
    data: T[];
    columns: LineListColumnMeta[];
    activeMenuCell: { rowId: string | number; columnId: string } | null;
    navigateTo?: { path: string; keyPath: keyof T };
    canEditRows: boolean;
    labels: RenderTableLabels;
    onAddRowAfter: (position: number) => void;
    onCellMenuOpen: (rowId: string | number, column: LineListColumnMeta, anchor: HTMLElement) => void;
    onMenuCloseDelay: () => void;
    onMenuCloseCancel: () => void;
    renderCell: (rowId: string | number, column: LineListColumnMeta) => React.ReactNode;
}

const DataRows = <T extends DataItem>({
    data,
    columns,
    activeMenuCell,
    navigateTo,
    canEditRows,
    labels,
    onAddRowAfter,
    onCellMenuOpen,
    onMenuCloseDelay,
    onMenuCloseCancel,
    renderCell,
}: DataRowsProps<T>) => {
    const openTimer = React.useRef<number | null>(null);
    const pendingCell = React.useRef<{ rowId: string | number; columnId: string } | null>(null);

    React.useEffect(() => {
        return () => {
            if (openTimer.current) {
                window.clearTimeout(openTimer.current);
                openTimer.current = null;
            }
        };
    }, []);

    const clearOpenTimer = () => {
        if (openTimer.current) {
            window.clearTimeout(openTimer.current);
            openTimer.current = null;
        }
        pendingCell.current = null;
    };

    const handleCellMouseEnter = (
        event: React.MouseEvent,
        rowId: string | number,
        columnMeta: LineListColumnMeta
    ) => {
        if (!canEditRows) {
            return;
        }
        if (
            activeMenuCell &&
            activeMenuCell.rowId === rowId &&
            activeMenuCell.columnId === columnMeta.column.id
        ) {
            onMenuCloseCancel();
        }
        clearOpenTimer();
        const anchor = event.currentTarget as HTMLElement;
        pendingCell.current = { rowId, columnId: columnMeta.column.id };
        openTimer.current = window.setTimeout(() => {
            if (
                pendingCell.current &&
                pendingCell.current.rowId === rowId &&
                pendingCell.current.columnId === columnMeta.column.id
            ) {
                onCellMenuOpen(rowId, columnMeta, anchor);
            }
            openTimer.current = null;
        }, 2000);
    };

    const handleCellMouseLeave = () => {
        clearOpenTimer();
        onMenuCloseDelay();
    };

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-between gap-3 border border-gray-200 px-4 py-6 text-sm text-gray-500">
                <span>{labels.emptyState}</span>
                {canEditRows && (
                    <button
                        type="button"
                        onClick={() => onAddRowAfter(0)}
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-gray-300"
                    >
                        {labels.addRowTitle}
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            {data.map((row, rowIndex) => (
                <div
                    key={row.id}
                    className="group relative flex transition-colors duration-150 hover:bg-gray-50"
                >
                    {canEditRows && (
                        <div className="relative w-6 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => onAddRowAfter(rowIndex)}
                                className="pointer-events-none absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-gray-300 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:text-blue-600 group-hover:hover:bg-blue-50"
                                aria-label={labels.addRowAbove(row.id)}
                                title={labels.addRowTitle}
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {columns.map((columnMeta) => {
                        const key = columnMeta.column.id;
                        const cellContent = (
                            <div className="block w-full min-w-0 break-words px-4 py-3 text-sm text-gray-800">
                                {renderCell(row.id, columnMeta)}
                            </div>
                        );

                        return (
                            <div
                                key={key}
                                className="relative flex-1 min-w-0 border border-gray-200"
                                onMouseEnter={(event) => handleCellMouseEnter(event, row.id, columnMeta)}
                                onMouseLeave={handleCellMouseLeave}
                            >
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
                </div>
            ))}
        </>
    );
};

export default DataRows;
