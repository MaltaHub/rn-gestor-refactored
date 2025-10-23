/**
 * Base Repository Pattern
 * Abstrai acesso a dados do Supabase
 * Implementa operações CRUD genéricas com segurança de tipos
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'
import { handleError, NotFoundError } from '@/shared/lib/errors'

export interface FindAllOptions<T> {
  filters?: Partial<Record<keyof T, unknown>>
  orderBy?: {
    column: keyof T & string
    ascending?: boolean
  }
  pagination?: {
    page: number
    limit: number
  }
  select?: string
}

/**
 * Repository base genérico
 * @template T - Tipo da entidade
 */
export abstract class BaseRepository<T extends Record<string, unknown>> {
  protected client: SupabaseClient

  constructor(
    protected readonly tableName: string,
    client?: SupabaseClient
  ) {
    this.client = client || supabase
  }

  /**
   * Busca todos os registros
   */
  async findAll(options: FindAllOptions<T> = {}): Promise<T[]> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(options.select || '*')

      // Filtros
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        }
      }

      // Ordenação
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        })
      }

      // Paginação
      if (options.pagination) {
        const { page, limit } = options.pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
      }

      const { data, error } = await query
      if (error) throw handleError(error)

      return (data ?? []) as T[]
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Busca por ID
   */
  async findById(id: string, select = '*'): Promise<T> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select(select)
        .eq('id', id)
        .single()

      if (error) throw handleError(error)
      if (!data) throw new NotFoundError(`Registro não encontrado (ID: ${id})`)

      return data as T
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Busca um registro por filtros
   */
  async findOne(filters: Partial<Record<keyof T, unknown>>, select = '*'): Promise<T | null> {
    try {
      let query = this.client.from(this.tableName).select(select)

      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value)
      }

      const { data, error } = await query.single()
      if (error?.code === 'PGRST116') return null
      if (error) throw handleError(error)

      return data as T
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Cria um novo registro
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const { data: created, error } = await this.client
        .from(this.tableName)
        .insert([data]) // ✅ Array mantém o tipo genérico
        .select()
        .single()

      if (error) throw handleError(error)
      if (!created) throw new Error('Falha ao criar registro')

      return created as T
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Cria múltiplos registros
   */
  async createMany(dataArray: Partial<T>[]): Promise<T[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .insert(dataArray)
        .select()

      if (error) throw handleError(error)
      return (data ?? []) as T[]
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Atualiza registro por ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: updated, error } = await this.client
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw handleError(error)
      if (!updated) throw new NotFoundError(`Registro não encontrado (ID: ${id})`)

      return updated as T
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Atualiza múltiplos registros por filtros
   */
  async updateMany(filters: Partial<Record<keyof T, unknown>>, data: Partial<T>): Promise<T[]> {
    try {
      let query = this.client.from(this.tableName).update(data)
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value)
      }

      const { data: updated, error } = await query.select()
      if (error) throw handleError(error)

      return (updated ?? []) as T[]
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Deleta registro por ID
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw handleError(error)
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Deleta múltiplos registros
   */
  async deleteMany(filters: Partial<Record<keyof T, unknown>>): Promise<number> {
    try {
      let query = this.client.from(this.tableName).delete()
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value)
      }

      const { count, error } = await query.select('*')
      if (error) throw handleError(error)

      return count ?? 0
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Conta registros
   */
  async count(filters?: Partial<Record<keyof T, unknown>>): Promise<number> {
    try {
      let query = this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value)
        }
      }

      const { count, error } = await query
      if (error) throw handleError(error)

      return count ?? 0
    } catch (error) {
      throw handleError(error)
    }
  }

  /**
   * Verifica existência por ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const { count, error } = await this.client
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('id', id)

      if (error) throw handleError(error)
      return (count ?? 0) > 0
    } catch (error) {
      throw handleError(error)
    }
  }
}
