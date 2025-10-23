/**
 * Formatadores de data e hora
 * Centraliza lógica de formatação de datas
 */

/**
 * Formata data para formato brasileiro (dd/MM/yyyy)
 * @param date - Date, string ISO ou null
 * @returns String formatada (ex: "23/10/2025") ou "-" se inválido
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR').format(dateObj)
}

/**
 * Formata data e hora (dd/MM/yyyy HH:mm)
 * @param date - Date, string ISO ou null
 * @returns String formatada (ex: "23/10/2025 19:30") ou "-" se inválido
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Formata apenas a hora (HH:mm)
 * @param date - Date, string ISO ou null
 * @returns String formatada (ex: "19:30") ou "-" se inválido
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Formata data relativa (ex: "há 2 dias", "em 3 horas")
 * @param date - Date, string ISO ou null
 * @returns String formatada relativamente à data atual
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return '-'

  const now = new Date()
  const diff = dateObj.getTime() - now.getTime()
  const seconds = Math.floor(Math.abs(diff) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

  if (days > 0) {
    return rtf.format(diff > 0 ? days : -days, 'day')
  } else if (hours > 0) {
    return rtf.format(diff > 0 ? hours : -hours, 'hour')
  } else if (minutes > 0) {
    return rtf.format(diff > 0 ? minutes : -minutes, 'minute')
  } else {
    return rtf.format(diff > 0 ? seconds : -seconds, 'second')
  }
}

/**
 * Formata período (data inicial - data final)
 * @param startDate - Data inicial
 * @param endDate - Data final
 * @returns String formatada (ex: "01/01/2025 - 31/01/2025")
 */
export function formatDateRange(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): string {
  const start = formatDate(startDate)
  const end = formatDate(endDate)

  if (start === '-' || end === '-') return '-'

  return `${start} - ${end}`
}

/**
 * Parse string de data brasileira para Date
 * @param dateStr - String no formato dd/MM/yyyy
 * @returns Date ou null se inválido
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null

  const parts = dateStr.split('/')
  if (parts.length !== 3) return null

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
  const year = parseInt(parts[2], 10)

  const date = new Date(year, month, day)

  return isNaN(date.getTime()) ? null : date
}
