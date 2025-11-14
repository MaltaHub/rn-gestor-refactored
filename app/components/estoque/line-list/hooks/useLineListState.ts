import React from 'react';
import { createDataStore } from '@/app/stores/line-list/useDataStore';
import { createDragStore } from '@/app/stores/line-list/useDragStore';
import { createFilterStore } from '@/app/stores/line-list/useFilterStore';
import { createEditStore } from '@/app/stores/line-list/useEditStore';
import { createMenuStore } from '@/app/stores/line-list/useMenuStore';
import { createUIStore } from '@/app/stores/line-list/useUIStore';
import {
    DataItem,
    EditingRowState,
    FilterDialogState,
    LineCardsProps,
    MenuPosition,
    RowMenuPosition,
    SortConfig,
} from '../types';

const isValidKeyPath = <T extends DataItem>(data: T[], keyPath: keyof T): boolean => {
    return data.every((item) => keyPath in item);
};

interface UseLineListStateReturn<T extends DataItem> {
    data: T[];
    keys: string[];
    hoveredHeader: string | null;
    setHoveredHeader: (key: string | null) => void;
    hoveredRow: string | number | null;
    setHoveredRow: (rowId: string | number | null) => void;
    dragState: {
        draggedIndex: number | null;
        dragOverIndex: number | null;
    };
    headerMenu: MenuPosition | null;
    rowMenu: RowMenuPosition | null;
    filterDialog: FilterDialogState | null;
    filterValue: string;
    setFilterValue: (value: string) => void;
    activeFilters: Record<string, string>;
    sortConfig: SortConfig | null;
    editingRow: EditingRowState<T> | null;
    filteredAndSortedData: T[];
    invalidKeyPath: boolean;
    isReadOnly: boolean;
    handleDragStart: (index: number) => void;
    handleDragOver: (event: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    handleDragLeave: () => void;
    handleHeaderMenuOpen: (event: React.MouseEvent, key: string) => void;
    handleRowMenuOpen: (event: React.MouseEvent, rowId: string | number) => void;
    closeContextMenus: () => void;
    closeMenus: () => void;
    handleSort: (key: string, direction: 'asc' | 'desc') => void;
    handleFilterOpen: (key: string, position: { x: number; y: number }) => void;
    handleFilterApply: () => void;
    handleFilterClear: (key: string) => void;
    handleFilterCancel: () => void;
    handleAddColumn: () => void;
    handleRemoveColumn: (key: string) => void;
    handleEditRow: (rowId: string | number) => void;
    handleSaveEdit: () => void;
    handleCancelEdit: () => void;
    handleDeleteRow: (rowId: string | number) => void;
    updateEditingRowField: (key: string, value: string) => void;
}

const createLineListStores = () => ({
    dataStore: createDataStore<DataItem>(),
    dragStore: createDragStore(),
    filterStore: createFilterStore(),
    editStore: createEditStore<DataItem>(),
    menuStore: createMenuStore(),
    uiStore: createUIStore(),
});

const useLineListState = <T extends DataItem>({
    data: initialData,
    navigateTo,
    onDataChange,
    mode = 'edit',
}: LineCardsProps<T>): UseLineListStateReturn<T> => {
    const { dataStore, dragStore, filterStore, editStore, menuStore, uiStore } = React.useMemo(
        () => createLineListStores(),
        []
    );

    const data = dataStore((state) => state.data);
    const filteredAndSortedData = dataStore((state) => state.filteredAndSortedData);
    const sortConfig = dataStore((state) => state.sortConfig);
    const activeFilters = dataStore((state) => state.activeFilters);
    const setData = dataStore((state) => state.setData);
    const setStoreKeys = dataStore((state) => state.setKeys);
    const setInvalidKeyPath = dataStore((state) => state.setInvalidKeyPath);
    const setSortConfig = dataStore((state) => state.setSortConfig);
    const addFilter = dataStore((state) => state.addFilter);
    const removeFilter = dataStore((state) => state.removeFilter);
    const addColumn = dataStore((state) => state.addColumn);
    const removeColumn = dataStore((state) => state.removeColumn);
    const updateRow = dataStore((state) => state.updateRow);
    const deleteRow = dataStore((state) => state.deleteRow);

    const draggedIndex = dragStore((state) => state.draggedIndex);
    const dragOverIndex = dragStore((state) => state.dragOverIndex);
    const setDraggedIndex = dragStore((state) => state.setDraggedIndex);
    const setDragOverIndex = dragStore((state) => state.setDragOverIndex);
    const resetDrag = dragStore((state) => state.resetDrag);

    const filterDialog = filterStore((state) => state.filterDialog);
    const filterValue = filterStore((state) => state.filterValue);
    const setFilterDialog = filterStore((state) => state.setFilterDialog);
    const setFilterValue = filterStore((state) => state.setFilterValue);
    const closeFilterDialog = filterStore((state) => state.closeFilterDialog);

    const editingRow = editStore((state) => state.editingRow);
    const setEditingRow = editStore((state) => state.setEditingRow);
    const updateEditingRowFieldInStore = editStore((state) => state.updateEditingRowField);
    const closeEditDialog = editStore((state) => state.closeEditDialog);

    const headerMenu = menuStore((state) => state.headerMenu);
    const rowMenu = menuStore((state) => state.rowMenu);
    const setHeaderMenu = menuStore((state) => state.setHeaderMenu);
    const setRowMenu = menuStore((state) => state.setRowMenu);
    const closeMenusStore = menuStore((state) => state.closeContextMenus);

    const hoveredHeader = uiStore((state) => state.hoveredHeader);
    const hoveredRow = uiStore((state) => state.hoveredRow);
    const setHoveredHeader = uiStore((state) => state.setHoveredHeader);
    const setHoveredRow = uiStore((state) => state.setHoveredRow);

    // Local state for keys
    const [keys, setKeys] = React.useState<string[]>(() =>
        initialData.length > 0 ? Object.keys(initialData[0]).filter((key) => key !== 'id') : []
    );

    const isReadOnly: boolean = mode === 'read-only';

    // Initialize data store on mount
    React.useEffect(() => {
        setData(initialData as DataItem[]);
    }, [initialData, setData]);

    // Update keys when data changes
    React.useEffect(() => {
        if (initialData.length > 0) {
            const newKeys = Object.keys(initialData[0]).filter((key) => key !== 'id');
            setKeys(newKeys);
            setStoreKeys(newKeys);
        }
    }, [initialData, setStoreKeys]);

    // Validate keyPath
    const invalidKeyPath = React.useMemo(() => {
        if (!navigateTo) {
            return false;
        }
        return !isValidKeyPath(initialData as DataItem[], navigateTo.keyPath as keyof DataItem);
    }, [navigateTo, initialData]);

    React.useEffect(() => {
        setInvalidKeyPath(invalidKeyPath);
    }, [invalidKeyPath, setInvalidKeyPath]);

    // Close menus helper
    // Close menus helper
    const closeContextMenus = React.useCallback(() => {
        closeMenusStore();
    }, [closeMenusStore]);

    const closeMenus = React.useCallback(() => {
        closeContextMenus();
        closeFilterDialog();
    }, [closeContextMenus, closeFilterDialog]);

    // Drag handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (event: React.DragEvent, index: number) => {
        event.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            const newKeys = [...keys];
            const [draggedKey] = newKeys.splice(draggedIndex, 1);
            newKeys.splice(dragOverIndex, 0, draggedKey);
            setKeys(newKeys);
            setStoreKeys(newKeys);
        }
        resetDrag();
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    // Menu handlers
    const handleHeaderMenuOpen = (event: React.MouseEvent, key: string) => {
        event.stopPropagation();
        event.preventDefault();
        setHeaderMenu({ key, x: event.clientX, y: event.clientY });
    };

    const handleRowMenuOpen = (event: React.MouseEvent, rowId: string | number) => {
        if (isReadOnly) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        setRowMenu({ rowId, x: event.clientX, y: event.clientY });
    };

    // Sort handler
    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        setSortConfig({ key, direction });
    };

    // Filter handlers
    const handleFilterOpen = (key: string, position: { x: number; y: number }) => {
        setFilterValue(activeFilters[key] || '');
        setFilterDialog({ key, x: position.x, y: position.y });
        closeContextMenus();
    };

    const handleFilterApply = () => {
        if (filterDialog) {
            addFilter(filterDialog.key, filterValue);
        }
        closeFilterDialog();
    };

    const handleFilterClear = (key: string) => {
        removeFilter(key);
    };

    const handleFilterCancel = () => {
        closeFilterDialog();
    };

    // Column handlers
    const handleAddColumn = () => {
        if (isReadOnly) {
            return;
        }
        const newColumnName = prompt('Nome da nova coluna:');
        if (newColumnName && !keys.includes(newColumnName)) {
            setKeys((prev) => [...prev, newColumnName]);
            addColumn(newColumnName);
            onDataChange?.(dataStore.getState().data as T[]);
        }
    };

    const handleRemoveColumn = (key: string) => {
        if (isReadOnly) {
            return;
        }
        if (confirm(`Remover a coluna "${key}"?`)) {
            setKeys((prev) => prev.filter((k) => k !== key));
            removeColumn(key);
            onDataChange?.(dataStore.getState().data as T[]);
        }
    };

    // Edit handlers
    const handleEditRow = (rowId: string | number) => {
        if (isReadOnly) {
            return;
        }
        const row = data.find((r) => r.id === rowId);
        if (row) {
            setEditingRow({ rowId, data: row as T });
        }
    };

    const handleSaveEdit = () => {
        if (!editingRow || isReadOnly) {
            return;
        }
        updateRow(editingRow.rowId, editingRow.data as DataItem);
        onDataChange?.(dataStore.getState().data as T[]);
        closeEditDialog();
    };

    const handleCancelEdit = () => {
        closeEditDialog();
    };

    // Delete handler
    const handleDeleteRow = (rowId: string | number) => {
        if (isReadOnly) {
            return;
        }
        if (confirm('Excluir esta linha?')) {
            deleteRow(rowId);
            onDataChange?.(dataStore.getState().data as T[]);
        }
    };

    // Edit field update
    const handleUpdateEditingRowField = (key: string, value: string) => {
        updateEditingRowFieldInStore(key, value);
    };

    // Global click handler for closing menus
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('[data-menu]') || target.closest('[data-menu-trigger]')) {
                return;
            }
            closeMenus();
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [closeMenus]);

    return {
        data: data as T[],
        keys,
        hoveredHeader,
        setHoveredHeader,
        hoveredRow,
        setHoveredRow,
        dragState: {
            draggedIndex,
            dragOverIndex,
        },
        headerMenu,
        rowMenu,
        filterDialog,
        filterValue,
        setFilterValue,
        activeFilters,
        sortConfig,
        editingRow: editingRow as EditingRowState<T> | null,
        filteredAndSortedData: filteredAndSortedData as T[],
        invalidKeyPath,
        isReadOnly,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragLeave,
        handleHeaderMenuOpen,
        handleRowMenuOpen,
        closeContextMenus,
        closeMenus,
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
        updateEditingRowField: handleUpdateEditingRowField,
    };
};

export default useLineListState;
