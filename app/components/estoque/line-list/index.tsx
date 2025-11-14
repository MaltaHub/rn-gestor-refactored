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
        isReadOnly,
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
                onHoverHeader={setHoveredHeader}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                onHeaderMenuClick={handleHeaderMenuOpen}
            />

            <DataRows
                data={filteredAndSortedData}
                keys={keys}
                hoveredRow={hoveredRow}
                onHoverRow={setHoveredRow}
                navigateTo={props.navigateTo}
                isReadOnly={isReadOnly}
                onRowMenuOpen={handleRowMenuOpen}
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
                isReadOnly={isReadOnly}
            />

            {!isReadOnly && (
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

            {!isReadOnly && (
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
