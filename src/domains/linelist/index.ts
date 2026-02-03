/**
 * LineList Domain - UI rendering for table lists
 * 
 * Re-exports de app/framework/table-render/render/line-list
 * Mantém compatibilidade com estrutura antiga enquanto segue DDD
 */

// Re-export from old location for backward compatibility
export { default as LineList } from '@/app/framework/table-render/render/line-list';
export * from '@/app/framework/table-render/render/line-list/types';

// Stores
export * from '@/app/framework/table-render/render/line-list/stores/useDragStore';
export * from '@/app/framework/table-render/render/line-list/stores/useEditStore';
export * from '@/app/framework/table-render/render/line-list/stores/useFilterStore';
export * from '@/app/framework/table-render/render/line-list/stores/useMenuStore';
export * from '@/app/framework/table-render/render/line-list/stores/useUIStore';
