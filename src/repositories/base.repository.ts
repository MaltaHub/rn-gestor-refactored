/**
 * Base Repository
 * Classe abstrata que fornece funcionalidades comuns para todos os repositories
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { IRepository, QueryFilter, RepositoryError } from './types';

export abstract class BaseRepository<T> implements IRepository<T> {
  constructor(
    protected supabase: SupabaseClient<Database>,
    protected tableName: string
  ) {}

  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName as never)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new RepositoryError(
          `Erro ao buscar ${this.tableName} por ID`,
          'FIND_BY_ID_ERROR',
          error
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError(
        `Erro inesperado ao buscar ${this.tableName}`,
        'UNEXPECTED_ERROR',
        error
      );
    }
  }

  async findAll(filters?: QueryFilter[]): Promise<T[]> {
    try {
      let query = this.supabase.from(this.tableName as never).select('*');

      if (filters) {
        filters.forEach(filter => {
          query = query.filter(
            filter.column,
            filter.operator || 'eq',
            filter.value
          );
        });
      }

      const { data, error } = await query;

      if (error) {
        throw new RepositoryError(
          `Erro ao listar ${this.tableName}`,
          'FIND_ALL_ERROR',
          error
        );
      }

      return (data || []) as T[];
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError(
        `Erro inesperado ao listar ${this.tableName}`,
        'UNEXPECTED_ERROR',
        error
      );
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const { data: created, error } = await this.supabase
        .from(this.tableName as never)
        .insert(data as never)
        .select()
        .single();

      if (error) {
        throw new RepositoryError(
          `Erro ao criar ${this.tableName}`,
          'CREATE_ERROR',
          error
        );
      }

      return created as T;
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError(
        `Erro inesperado ao criar ${this.tableName}`,
        'UNEXPECTED_ERROR',
        error
      );
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: updated, error } = await this.supabase
        .from(this.tableName as never)
        .update(data as never)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new RepositoryError(
          `Erro ao atualizar ${this.tableName}`,
          'UPDATE_ERROR',
          error
        );
      }

      return updated as T;
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError(
        `Erro inesperado ao atualizar ${this.tableName}`,
        'UNEXPECTED_ERROR',
        error
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName as never)
        .delete()
        .eq('id', id);

      if (error) {
        throw new RepositoryError(
          `Erro ao deletar ${this.tableName}`,
          'DELETE_ERROR',
          error
        );
      }
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError(
        `Erro inesperado ao deletar ${this.tableName}`,
        'UNEXPECTED_ERROR',
        error
      );
    }
  }

  protected handleError(operation: string, error: unknown): never {
    if (error instanceof RepositoryError) throw error;
    throw new RepositoryError(
      `Erro ao executar ${operation} em ${this.tableName}`,
      'OPERATION_ERROR',
      error
    );
  }
}
