/**
 * VeiculoStatus
 * Badge de status do veículo
 */

'use client'

import type { EstadoVenda } from '../model/types'
import { ESTADO_VENDA_LABELS, ESTADO_VENDA_COLORS } from '../model/constants'

export interface VeiculoStatusProps {
  status: EstadoVenda
  className?: string
}

const colorClasses: Record<string, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

export function VeiculoStatus({ status, className = '' }: VeiculoStatusProps) {
  const label = ESTADO_VENDA_LABELS[status]
  const color = ESTADO_VENDA_COLORS[status]
  const colorClass = colorClasses[color] || colorClasses.green

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  )
}
