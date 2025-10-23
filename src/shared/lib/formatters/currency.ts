/**
 * Formatadores de moeda
 * Centraliza lógica de formatação de valores monetários
 */

/**
 * Formata valor para Real brasileiro (R$)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como moeda (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00'

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata valor para moeda sem símbolo
 * @param value - Valor numérico a ser formatado
 * @returns String formatada (ex: "1.234,56")
 */
export function formatCurrencyNoSymbol(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0,00'

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Parse string de moeda para número
 * @param value - String com valor monetário (ex: "R$ 1.234,56" ou "1.234,56")
 * @returns Número parseado ou 0 se inválido
 */
export function parseCurrency(value: string): number {
  if (!value) return 0

  // Remove tudo exceto dígitos e vírgula
  const cleaned = value.replace(/[^\d,]/g, '')
  // Substitui vírgula por ponto
  const normalized = cleaned.replace(',', '.')

  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Formata valor compacto (K, M, B)
 * @param value - Valor numérico
 * @returns String formatada compacta (ex: "1,2K", "3,5M")
 */
export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0'

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}
