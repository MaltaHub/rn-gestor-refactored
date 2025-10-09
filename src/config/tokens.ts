/**
 * Design Tokens
 * Sistema centralizado de valores de design reutilizáveis
 * 
 * ## Como usar:
 * 
 * ### 1. Importar tokens necessários
 * ```tsx
 * import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/config';
 * ```
 * 
 * ### 2. Usar em estilos inline
 * ```tsx
 * <div style={{ 
 *   padding: SPACING.lg, 
 *   fontSize: FONT_SIZE.base,
 *   borderRadius: BORDER_RADIUS.md 
 * }}>
 * ```
 * 
 * ### 3. Usar com Tailwind (via classes arbitrárias)
 * ```tsx
 * <div className={`p-[${SPACING.lg}] text-[${FONT_SIZE.base}]`}>
 * ```
 * 
 * ### 4. Criar variantes customizadas
 * ```tsx
 * const sizes = {
 *   sm: { padding: SPACING.sm, fontSize: FONT_SIZE.sm },
 *   md: { padding: SPACING.md, fontSize: FONT_SIZE.base },
 * };
 * ```
 */

export const SPACING = {
  none: '0',        // 0px
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
} as const;

export const FONT_SIZE = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
} as const;

export const FONT_WEIGHT = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const LINE_HEIGHT = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
} as const;

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
} as const;

export const TRANSITIONS = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  toast: 50,
} as const;

export type SpacingToken = keyof typeof SPACING;
export type FontSizeToken = keyof typeof FONT_SIZE;
export type FontWeightToken = keyof typeof FONT_WEIGHT;
export type BorderRadiusToken = keyof typeof BORDER_RADIUS;
export type ShadowToken = keyof typeof SHADOWS;
export type TransitionToken = keyof typeof TRANSITIONS;
