/**
 * Tipos da entidade Veiculo
 * Define interfaces e tipos relacionados a veículos
 */

import type { Database } from '@/shared/api'

// Tipos do banco
export type VeiculoDb = Database['public']['Tables']['veiculos']['Row']
export type VeiculoInsert = Database['public']['Tables']['veiculos']['Insert']
export type VeiculoUpdate = Database['public']['Tables']['veiculos']['Update']

// Enums
export type EstadoVeiculo = Database['public']['Enums']['estado_veiculo']
export type EstadoVenda = Database['public']['Enums']['estado_venda']

/**
 * Interface principal do Veiculo
 * Representa um veículo no sistema
 */
export interface Veiculo {
  id: string
  placa: string
  chassi: string | null
  ano_fabricacao: number | null
  ano_modelo: number | null
  cor: string | null
  hodometro: number
  estado_veiculo: EstadoVeiculo | null
  estado_venda: EstadoVenda
  observacao: string | null
  preco_venal: number | null
  local_id: string | null
  modelo_id: string | null
  empresa_id: string
  registrado_em: string
  registrado_por: string
  editado_em: string
  editado_por: string
  estagio_documentacao: string | null
}

/**
 * Filtros para busca de veículos
 */
export interface VeiculoFilters {
  placa?: string
  modelo_id?: string
  estado_venda?: EstadoVenda | EstadoVenda[]
  estado_veiculo?: EstadoVeiculo | EstadoVeiculo[]
  loja_id?: string
  ano_fabricacao_min?: number
  ano_fabricacao_max?: number
  preco_min?: number
  preco_max?: number
  search?: string
}

/**
 * Input para criar veículo
 */
export interface VeiculoCreateInput {
  placa: string
  chassi?: string
  ano_fabricacao?: number
  ano_modelo?: number
  cor?: string
  hodometro: number
  estado_veiculo?: EstadoVeiculo
  estado_venda: EstadoVenda
  observacao?: string
  preco_venal?: number
  local_id?: string
  modelo_id?: string
}

/**
 * Input para atualizar veículo
 */
export type VeiculoUpdateInput = Partial<VeiculoCreateInput>
