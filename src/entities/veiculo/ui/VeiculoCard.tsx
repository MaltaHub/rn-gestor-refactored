/**
 * VeiculoCard
 * Componente de card para exibir resumo do veículo
 */

'use client'

import type { VeiculoUI } from '../api/transforms'

export interface VeiculoCardProps {
  veiculo: VeiculoUI
  onClick?: () => void
  className?: string
}

export function VeiculoCard({ veiculo, onClick, className = '' }: VeiculoCardProps) {
  return (
    <div
      className={`rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Placa e Status */}
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold">{veiculo.placaFormatada}</h3>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            veiculo.estado_venda === 'disponivel'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : veiculo.estado_venda === 'vendido'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          {veiculo.estadoVendaLabel}
        </span>
      </div>

      {/* Descrição */}
      <p className="mb-3 text-sm text-muted-foreground">{veiculo.descricao}</p>

      {/* Informações principais */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {veiculo.cor && (
          <div>
            <span className="text-muted-foreground">Cor:</span>{' '}
            <span className="font-medium">{veiculo.cor}</span>
          </div>
        )}

        <div>
          <span className="text-muted-foreground">Hodômetro:</span>{' '}
          <span className="font-medium">{veiculo.hodometroFormatado}</span>
        </div>

        {veiculo.precoFormatado && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Preço:</span>{' '}
            <span className="text-lg font-semibold text-primary">{veiculo.precoFormatado}</span>
          </div>
        )}
      </div>
    </div>
  )
}
