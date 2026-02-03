'use client';

import React from 'react';
import HeaderRow from './components/HeaderRow';
import DataRows from './components/DataRows';
import HeaderMenu from './components/HeaderMenu';
import RowMenu from './components/RowMenu';
import FilterDialog from './components/FilterDialog';
import EditRowDialog from './components/EditRowDialog';
import useLineListState from './hooks/useLineListState';
import { DataItem, LineListProps } from './types';

const LineListComponent = <T extends DataItem>(props: LineListProps<T>) => {
    const {
        columns,
        hiddenColumns,
        canEditHeaders,
        canStructureEdit,
        allowColumnReorder,
        canEditRows,
        labels,
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
        editingCell,
        editingValue,
        invalidKeyPath,
        renderCell,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragLeave,
        handleHeaderMenuOpen,
        handleRowMenuOpen,
        closeContextMenus,
        scheduleMenuClose,
        cancelMenuClose,
        handleSort,
        handleFilterOpen,
        handleFilterApply,
        handleFilterClear,
        handleFilterCancel,
        handleAddColumn,
        handleRemoveColumn,
        handleRenameColumn,
        handleHideColumn,
        handleShowColumn,
        handleAddRow,
        handleEditRow,
        handleDuplicateRow,
        handleSaveEdit,
        handleCancelEdit,
        handleDeleteRow,
        updateEditingRowField,
        handleCellEditStart,
        handleCellEditChange,
        handleCellEditCommit,
        handleCellEditCancel,
    } = useLineListState(props);

    if (invalidKeyPath && props.navigateTo) {
        console.error(`Invalid keyPath: ${String(props.navigateTo.keyPath)} does not exist na tabela fornecida.`);
        return null;
    }

    return (
        <div className={`flex flex-col w-full ${props.className ?? ''}`}>
            <HeaderRow
                columns={columns}
                draggedIndex={dragState.draggedIndex}
                dragOverIndex={dragState.dragOverIndex}
                activeFilters={activeFilters}
                sortConfig={sortConfig}
                activeMenuColumnId={headerMenu?.columnId ?? filterDialog?.columnId ?? null}
                canEditHeaders={canEditHeaders}
                canStructureEdit={canStructureEdit}
                allowColumnReorder={allowColumnReorder}
                canEditRows={canEditRows}
                labels={labels}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                onMenuOpen={handleHeaderMenuOpen}
                onMenuCloseDelay={scheduleMenuClose}
                onMenuCloseCancel={cancelMenuClose}
                onAddColumnAfter={(position) => handleAddColumn({ position })}
            />

            <DataRows
                data={filteredAndSortedData}
                columns={columns}
                activeMenuCell={
                    rowMenu && rowMenu.columnId ? { rowId: rowMenu.rowId, columnId: rowMenu.columnId } : null
                }
                navigateTo={props.navigateTo}
                canEditRows={canEditRows}
                labels={labels}
                editingCell={editingCell}
                editingValue={editingValue}
                onCellEditStart={handleCellEditStart}
                onCellEditChange={handleCellEditChange}
                onCellEditCommit={handleCellEditCommit}
                onCellEditCancel={handleCellEditCancel}
                onAddRowAfter={(position) => handleAddRow({ position })}
                onCellMenuOpen={handleRowMenuOpen}
                onMenuCloseDelay={scheduleMenuClose}
                onMenuCloseCancel={cancelMenuClose}
                renderCell={renderCell}
            />

            <HeaderMenu
                menu={headerMenu}
                activeFilters={activeFilters}
                labels={labels}
                onSort={handleSort}
                onFilterOpen={handleFilterOpen}
                onFilterClear={handleFilterClear}
                onAddColumn={handleAddColumn}
                onRemoveColumn={handleRemoveColumn}
                onRenameColumn={handleRenameColumn}
                onHideColumn={handleHideColumn}
                onShowColumn={handleShowColumn}
                hiddenColumns={hiddenColumns}
                onCloseMenu={closeContextMenus}
                canStructureEdit={canStructureEdit}
                onHoverStart={cancelMenuClose}
                onHoverEnd={scheduleMenuClose}
            />

            {canEditRows && (
                <RowMenu
                    menu={rowMenu}
                    labels={labels}
                    onEditRow={handleEditRow}
                    onDuplicateRow={handleDuplicateRow}
                    onDeleteRow={handleDeleteRow}
                    onCloseMenu={closeContextMenus}
                    onHoverStart={cancelMenuClose}
                    onHoverEnd={scheduleMenuClose}
                />
            )}

            <FilterDialog
                dialog={filterDialog}
                value={filterValue}
                labels={labels}
                onChange={setFilterValue}
                onApply={handleFilterApply}
                onCancel={handleFilterCancel}
                onHoverStart={cancelMenuClose}
                onHoverEnd={scheduleMenuClose}
            />

            {canEditRows && (
                <EditRowDialog
                    editingRow={editingRow}
                    columns={columns}
                    labels={labels}
                    onFieldChange={updateEditingRowField}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                />
            )}
        </div>
    );
};

const LineList = LineListComponent as <T extends DataItem>(props: LineListProps<T>) => React.ReactElement;

export default LineList;
