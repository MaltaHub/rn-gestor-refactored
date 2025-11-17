'use client';

import React from 'react';
import HeaderRow from './components/HeaderRow';
import DataRows from './components/DataRows';
import HeaderMenu from './components/HeaderMenu';
import RowMenu from './components/RowMenu';
import FilterDialog from './components/FilterDialog';
import EditRowDialog from './components/EditRowDialog';
import useLineListState from './hooks/useLineListState';
import { DataItem, LineCardsProps } from './types';

const LineCardsComponent = <T extends DataItem>(props: LineCardsProps<T>) => {
    const {
        keys,
        canStructureEdit,
        allowColumnReorder,
        canEditRows,
        hoveredHeader,
        setHoveredHeader,
        hoveredRow,
        setHoveredRow,
        dragState,
        activeFilters,
        sortConfig,
        filteredAndSortedData,
        headerMenu,
        rowMenu,
        filterDialog,
        filterValue,
        setFilterValue,
        editingRow,
        invalidKeyPath,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragLeave,
        handleHeaderMenuOpen,
        handleRowMenuOpen,
        closeContextMenus,
        handleSort,
        handleFilterOpen,
        handleFilterApply,
        handleFilterClear,
        handleFilterCancel,
        handleAddColumn,
        handleRemoveColumn,
        handleRenameColumn,
        handleAddRow,
        handleEditRow,
        handleSaveEdit,
        handleCancelEdit,
        handleDeleteRow,
        updateEditingRowField,
    } = useLineListState(props);

    if (invalidKeyPath && props.navigateTo) {
        console.error(`Invalid keyPath: ${String(props.navigateTo.keyPath)} does not exist in data items.`);
        return null;
    }

    return (
        <div className="flex flex-col w-full">
            <HeaderRow
                keys={keys}
                draggedIndex={dragState.draggedIndex}
                dragOverIndex={dragState.dragOverIndex}
                activeFilters={activeFilters}
                sortConfig={sortConfig}
                hoveredHeader={hoveredHeader}
                canStructureEdit={canStructureEdit}
                allowColumnReorder={allowColumnReorder}
                onHoverHeader={setHoveredHeader}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                onHeaderMenuClick={handleHeaderMenuOpen}
                onAddColumnAfter={(position) => handleAddColumn({ position })}
                onRenameColumn={handleRenameColumn}
            />

            {canEditRows && (
                <div className="flex justify-end py-3">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded shadow hover:bg-blue-600 transition-colors"
                        onClick={() => handleAddRow()}
                    >
                        Adicionar linha
                    </button>
                </div>
            )}

            <DataRows
                data={filteredAndSortedData}
                keys={keys}
                hoveredRow={hoveredRow}
                onHoverRow={setHoveredRow}
                navigateTo={props.navigateTo}
                canEditRows={canEditRows}
                onRowMenuOpen={handleRowMenuOpen}
                onAddRowAfter={(position) => handleAddRow({ position })}
            />

            <HeaderMenu
                menu={headerMenu}
                activeFilters={activeFilters}
                onSort={handleSort}
                onFilterOpen={handleFilterOpen}
                onFilterClear={handleFilterClear}
                onAddColumn={handleAddColumn}
                onRemoveColumn={handleRemoveColumn}
                onCloseMenu={closeContextMenus}
                canStructureEdit={canStructureEdit}
            />

            {canEditRows && (
                <RowMenu
                    menu={rowMenu}
                    onEditRow={handleEditRow}
                    onDeleteRow={handleDeleteRow}
                    onCloseMenu={closeContextMenus}
                />
            )}

            <FilterDialog
                dialog={filterDialog}
                value={filterValue}
                onChange={setFilterValue}
                onApply={handleFilterApply}
                onCancel={handleFilterCancel}
            />

            {canEditRows && (
                <EditRowDialog
                    editingRow={editingRow}
                    keys={keys}
                    onFieldChange={updateEditingRowField}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                />
            )}
        </div>
    );
};

const LineCards = LineCardsComponent as <T extends DataItem>(props: LineCardsProps<T>) => React.ReactElement;

export default LineCards;
