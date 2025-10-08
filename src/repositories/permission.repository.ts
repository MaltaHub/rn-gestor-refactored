/**
 * PermissionRepository
 * Gerencia permissões de roles
 */

import { Database } from '@/types/supabase';
import { RepositoryError } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

type PermissaoPapel = Database['public']['Tables']['permissoes_papel']['Row'];
type UserRole = Database['public']['Enums']['papel_usuario_empresa'];

export class PermissionRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findByRoleAndEmpresa(
    papel: UserRole,
    empresaId: string
  ): Promise<PermissaoPapel[]> {
    try {
      const { data, error } = await this.supabase
        .from('permissoes_papel')
        .select('*')
        .eq('papel', papel)
        .eq('empresa_id', empresaId);

      if (error) {
        throw new RepositoryError(
          'Erro ao buscar permissões do papel',
          'FIND_PERMISSIONS_ERROR',
          error
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError(
        'Erro inesperado ao buscar permissões',
        'UNEXPECTED_ERROR',
        error
      );
    }
  }

  async checkPermission(
    papel: UserRole,
    empresaId: string,
    operacao: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('permissoes_papel')
        .select('permitido')
        .eq('papel', papel)
        .eq('empresa_id', empresaId)
        .eq('operacao', operacao)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return false;
        throw new RepositoryError(
          'Erro ao verificar permissão',
          'CHECK_PERMISSION_ERROR',
          error
        );
      }

      return data?.permitido || false;
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      return false;
    }
  }

  async createPermission(
    papel: UserRole,
    empresaId: string,
    operacao: string,
    permitido: boolean = true
  ): Promise<PermissaoPapel> {
    try {
      const { data, error } = await this.supabase
        .from('permissoes_papel')
        .insert({
          papel,
          empresa_id: empresaId,
          operacao,
          permitido,
        })
        .select()
        .single();

      if (error) {
        throw new RepositoryError(
          'Erro ao criar permissão',
          'CREATE_PERMISSION_ERROR',
          error
        );
      }

      return data;
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError(
        'Erro inesperado ao criar permissão',
        'UNEXPECTED_ERROR',
        error
      );
    }
  }
}
