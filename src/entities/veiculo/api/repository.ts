/**
 * VeiculoRepository
 * Camada de acesso a dados para veículos
 * Extende BaseRepository com métodos específicos
 */

import { BaseRepository } from '@/shared/api/repository'
import type { Veiculo, VeiculoFilters } from '../model/types'
import { handleError } from '@/shared/lib/errors'

export class VeiculoRepository extends BaseRepository<Veiculo> {
  constructor() {
    super('veiculos')
  }

  /**
   * Busca veículo por placa
   * @param placa - Placa do veículo (normalizada)
   * @returns Veículo encontrado ou null
   */
  async findByPlaca(placa: string): Promise<Veiculo | null> {
    try {
      // Normalizar placa (remover formatação)
      const placaNormalizada = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase()

      return await this.findOne({ placa: placaNormalizada })
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Busca veículos por loja
   * Faz join com veiculos_loja
   */
  async findByLoja(lojaId: string): Promise<Veiculo[]> {
    try {
      const { data, error } = await this.client
        .from('veiculos_loja')
        .select(`
          veiculo_id,
          veiculos (*)
        `)
        .eq('loja_id', lojaId)

      if (error) throw handleError(error)

      // Extrair veículos do join
      return (data || [])
        .map((item: any) => item.veiculos)
        .filter(Boolean) as Veiculo[]
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Busca veículos com filtros avançados
   * @param filters - Filtros de busca
   * @returns Array de veículos
   */
  async findWithFilters(filters: VeiculoFilters): Promise<Veiculo[]> {
    try {
      let query = this.client.from(this.tableName).select('*')

      // Aplicar filtros
      if (filters.placa) {
        const placaNormalizada = filters.placa.replace(/[^A-Z0-9]/gi, '').toUpperCase()
        query = query.ilike('placa', `%${placaNormalizada}%`)
      }

      if (filters.modelo_id) {
        query = query.eq('modelo_id', filters.modelo_id)
      }

      if (filters.estado_venda) {
        if (Array.isArray(filters.estado_venda)) {
          query = query.in('estado_venda', filters.estado_venda)
        } else {
          query = query.eq('estado_venda', filters.estado_venda)
        }
      }

      if (filters.estado_veiculo) {
        if (Array.isArray(filters.estado_veiculo)) {
          query = query.in('estado_veiculo', filters.estado_veiculo)
        } else {
          query = query.eq('estado_veiculo', filters.estado_veiculo)
        }
      }

      if (filters.ano_fabricacao_min) {
        query = query.gte('ano_fabricacao', filters.ano_fabricacao_min)
      }

      if (filters.ano_fabricacao_max) {
        query = query.lte('ano_fabricacao', filters.ano_fabricacao_max)
      }

      // Search em múltiplos campos
      if (filters.search) {
        const searchTerm = filters.search.replace(/[^A-Z0-9]/gi, '').toUpperCase()
        query = query.or(`placa.ilike.%${searchTerm}%,chassi.ilike.%${searchTerm}%,cor.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.order('registrado_em', { ascending: false })

      if (error) throw handleError(error)

      return (data || []) as Veiculo[]
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Busca veículos disponíveis para venda
   * @returns Array de veículos disponíveis
   */
  async findDisponiveis(): Promise<Veiculo[]> {
    return this.findAll({
      filters: {
        estado_venda: 'disponivel',
      },
      orderBy: {
        column: 'registrado_em',
        ascending: false,
      },
    })
  }

  /**
   * Conta veículos por estado de venda
   * @returns Objeto com contagens por estado
   */
  async countByEstadoVenda(): Promise<Record<string, number>> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('estado_venda')

      if (error) throw handleError(error)

      // Contar por estado
      const counts: Record<string, number> = {}
      data?.forEach((item: any) => {
        const estado = item.estado_venda
        counts[estado] = (counts[estado] || 0) + 1
      })

      return counts
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Verifica se placa já existe
   * @param placa - Placa a verificar
   * @param excludeId - ID a excluir da busca (para updates)
   * @returns true se existe
   */
  async placaExists(placa: string, excludeId?: string): Promise<boolean> {
    try {
      const placaNormalizada = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase()

      let query = this.client
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('placa', placaNormalizada)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { error, count } = await query

      if (error) throw handleError(error)

      return (count || 0) > 0
    } catch (error) {
      throw handleError(error)
    }
  }
}

/**
 * Instância singleton do repository
 */
export const veiculoRepository = new VeiculoRepository()
