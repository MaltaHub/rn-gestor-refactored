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
        columns,
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
        getCellValue,
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
        console.error(`Invalid keyPath: ${String(props.navigateTo.keyPath)} does not exist na tabela fornecida.`);
        return null;
    }

    return (
        <div className="flex flex-col w-full">
            <HeaderRow
                columns={columns}
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
            />

            <DataRows
                data={filteredAndSortedData}
                columns={columns}
                hoveredRow={hoveredRow}
                onHoverRow={setHoveredRow}
                navigateTo={props.navigateTo}
                canEditRows={canEditRows}
                onRowMenuOpen={handleRowMenuOpen}
                onAddRowAfter={(position) => handleAddRow({ position })}
                getCellValue={getCellValue}
            />

            <HeaderMenu
                menu={headerMenu}
                activeFilters={activeFilters}
                onSort={handleSort}
                onFilterOpen={handleFilterOpen}
                onFilterClear={handleFilterClear}
                onAddColumn={handleAddColumn}
                onRemoveColumn={handleRemoveColumn}
                onRenameColumn={handleRenameColumn}
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
                    columns={columns}
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
