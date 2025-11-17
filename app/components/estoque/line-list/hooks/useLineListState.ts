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
    canEditHeaders: boolean;
    canStructureEdit: boolean;
    allowColumnReorder: boolean;
    canEditRows: boolean;
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
    handleAddColumn: (options?: { position?: number; name?: string }) => void;
    handleRemoveColumn: (key: string) => void;
    handleRenameColumn: (currentKey: string, nextKey: string) => boolean;
    handleAddRow: (options?: { position?: number }) => void;
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
    const renameColumn = dataStore((state) => state.renameColumn);
    const addRow = dataStore((state) => state.addRow);
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
    const canStructureEdit = mode === 'edit';
    const canEditHeaders = mode !== 'read-only';
    const canEditRows = mode !== 'read-only';
    const allowColumnReorder = true;

    const clampPosition = React.useCallback((position: number | undefined, max: number) => {
        if (position === undefined) {
            return max;
        }
        if (Number.isNaN(position)) {
            return max;
        }
        return Math.max(0, Math.min(position, max));
    }, []);

    const generateUniqueColumnName = React.useCallback(
        (base = 'Nova coluna') => {
            let counter = 1;
            let candidate = `${base} ${counter}`;
            while (keys.includes(candidate)) {
                counter += 1;
                candidate = `${base} ${counter}`;
            }
            return candidate;
        },
        [keys]
    );

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
        if (!allowColumnReorder) {
            return;
        }
        setDraggedIndex(index);
    };

    const handleDragOver = (event: React.DragEvent, index: number) => {
        if (!allowColumnReorder) {
            return;
        }
        event.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (!allowColumnReorder) {
            return;
        }
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
        if (!allowColumnReorder) {
            return;
        }
        setDragOverIndex(null);
    };

    // Menu handlers
    const handleHeaderMenuOpen = (event: React.MouseEvent, key: string) => {
        if (!canStructureEdit) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        setHeaderMenu({ key, x: event.clientX, y: event.clientY });
    };

    const handleRowMenuOpen = (event: React.MouseEvent, rowId: string | number) => {
        if (!canEditRows) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        setRowMenu({ rowId, x: event.clientX, y: event.clientY });
    };

    // Sort handler
    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        if (!canEditHeaders) {
            return;
        }
        setSortConfig({ key, direction });
    };

    // Filter handlers
    const handleFilterOpen = (key: string, position: { x: number; y: number }) => {
        if (!canEditHeaders) {
            return;
        }
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
    const handleAddColumn = (options?: { position?: number; name?: string }) => {
        if (!canStructureEdit) {
            return;
        }
        const desiredName = options?.name?.trim();
        const candidateName = desiredName && !keys.includes(desiredName) ? desiredName : generateUniqueColumnName();
        const insertionIndex = clampPosition(options?.position, keys.length);
        setKeys((prev) => {
            const nextKeys = [...prev];
            nextKeys.splice(insertionIndex, 0, candidateName);
            return nextKeys;
        });
        addColumn(candidateName, insertionIndex);
        onDataChange?.(dataStore.getState().data as T[]);
    };

    const handleRemoveColumn = (key: string) => {
        if (!canStructureEdit) {
            return;
        }
        if (keys.length <= 1) {
            alert('A tabela precisa ter pelo menos uma coluna.');
            return;
        }
        if (confirm(`Remover a coluna "${key}"?`)) {
            setKeys((prev) => prev.filter((k) => k !== key));
            removeColumn(key);
            onDataChange?.(dataStore.getState().data as T[]);
        }
    };

    const handleRenameColumn = (currentKey: string, nextKey: string) => {
        if (!canStructureEdit) {
            return false;
        }
        const trimmed = nextKey.trim();
        if (!trimmed || trimmed.toLowerCase() === 'id') {
            return false;
        }
        if (trimmed === currentKey) {
            return true;
        }
        if (keys.includes(trimmed)) {
            alert('Já existe uma coluna com este nome.');
            return false;
        }
        setKeys((prev) => prev.map((key) => (key === currentKey ? trimmed : key)));
        const renamed = renameColumn(currentKey, trimmed);
        if (renamed) {
            onDataChange?.(dataStore.getState().data as T[]);
        }
        return renamed;
    };

    const handleAddRow = (options?: { position?: number }) => {
        if (!canEditRows) {
            return;
        }
        if (keys.length === 0) {
            alert('Adicione ao menos uma coluna antes de criar linhas.');
            return;
        }
        addRow(clampPosition(options?.position, data.length));
        onDataChange?.(dataStore.getState().data as T[]);
    };

    // Edit handlers
    const handleEditRow = (rowId: string | number) => {
        if (!canEditRows) {
            return;
        }
        const row = data.find((r) => r.id === rowId);
        if (row) {
            setEditingRow({ rowId, data: row as T });
        }
    };

    const handleSaveEdit = () => {
        if (!editingRow || !canEditRows) {
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
        if (!canEditRows) {
            return;
        }
        if (data.length <= 1) {
            alert('A tabela precisa manter ao menos uma linha.');
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
        canEditHeaders,
        canStructureEdit,
        allowColumnReorder,
        canEditRows,
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
        handleRenameColumn,
        handleAddRow,
        handleEditRow,
        handleSaveEdit,
        handleCancelEdit,
        handleDeleteRow,
        updateEditingRowField: handleUpdateEditingRowField,
    };
};

export default useLineListState;
