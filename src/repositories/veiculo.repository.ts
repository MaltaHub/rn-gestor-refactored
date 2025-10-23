/**
 * VeiculoRepository
 * Gerencia acesso a dados de veículos
 */

import { BaseRepository } from './base.repository';
import { Database } from '@/types/supabase';
import { callRpc } from '@/lib/supabase-client';
import { RPC_FUNCTIONS } from '@/config';
import { RepositoryError } from './types';

type Veiculo = Database['public']['Tables']['veiculos']['Row'];

export interface VeiculoCreatePayload {
  modelo_id: string;
  ano: number;
  cor: string;
  placa?: string;
  chassi?: string;
  km?: number;
  estado_venda?: string;
  observacoes?: string;
  caracteristicas?: string[];
}

export interface VeiculoUpdatePayload extends Partial<VeiculoCreatePayload> {
  adicionar_caracteristicas?: string[];
  remover_caracteristicas?: string[];
}

export class VeiculoRepository extends BaseRepository<Veiculo> {
  constructor(supabase: unknown) {
    super(supabase as never, 'veiculos');
  }

  async createWithRPC(dados: VeiculoCreatePayload): Promise<unknown> {
    try {
      const result = await callRpc(RPC_FUNCTIONS.VEICULOS, {
        operacao: 'criar',
        dados,
      });
      return result;
    } catch (error) {
      throw new RepositoryError(
        'Erro ao criar veículo via RPC',
        'CREATE_RPC_ERROR',
        error
      );
    }
  }

  async updateWithRPC(id: string, dados: VeiculoUpdatePayload): Promise<unknown> {
    try {
      const { adicionar_caracteristicas, remover_caracteristicas, ...resto } = dados;

      const payload = {
        ...resto,
        adicionar_caracteristicas: adicionar_caracteristicas ?? [],
        remover_caracteristicas: remover_caracteristicas ?? [],
      };

      const result = await callRpc(RPC_FUNCTIONS.VEICULOS, {
        operacao: 'atualizar',
        dados: payload,
        id,
      });
      return result;
    } catch (error) {
      throw new RepositoryError(
        'Erro ao atualizar veículo via RPC',
        'UPDATE_RPC_ERROR',
        error
      );
    }
  }

  async deleteWithRPC(id: string): Promise<unknown> {
    try {
      const result = await callRpc(RPC_FUNCTIONS.VEICULOS, {
        operacao: 'excluir',
        id,
      });
      return result;
    } catch (error) {
      throw new RepositoryError(
        'Erro ao deletar veículo via RPC',
        'DELETE_RPC_ERROR',
        error
      );
    }
  }

  async findByEmpresa(empresaId: string): Promise<Veiculo[]> {
    return this.findAll([
      { column: 'empresa_id', operator: 'eq', value: empresaId },
    ]);
  }

  async findByEstadoVenda(estado: string, empresaId?: string): Promise<Veiculo[]> {
    const filters = [
      { column: 'estado_venda', operator: 'eq' as const, value: estado },
    ];
    
    if (empresaId) {
      filters.push({ column: 'empresa_id', operator: 'eq' as const, value: empresaId });
    }

    return this.findAll(filters);
  }
}
