/**
 * EstoqueService - Nova camada usando Repository Pattern
 */

import { supabase } from '@/lib/supabase';
import { VeiculoRepository } from '@/repositories';
import type { VeiculoCreatePayload, VeiculoUpdatePayload } from '@/repositories/veiculo.repository';
import { handleError } from '@/lib/errors';

export class EstoqueService {
  private veiculoRepo: VeiculoRepository;

  constructor() {
    this.veiculoRepo = new VeiculoRepository(supabase);
  }

  async criarVeiculo(dados: VeiculoCreatePayload) {
    try {
      return await this.veiculoRepo.createWithRPC(dados);
    } catch (error) {
      throw handleError(error);
    }
  }

  async atualizarVeiculo(id: string, dados: VeiculoUpdatePayload) {
    try {
      return await this.veiculoRepo.updateWithRPC(id, dados);
    } catch (error) {
      throw handleError(error);
    }
  }

  async deletarVeiculo(id: string) {
    try {
      return await this.veiculoRepo.deleteWithRPC(id);
    } catch (error) {
      throw handleError(error);
    }
  }

  async buscarVeiculoPorId(id: string) {
    try {
      return await this.veiculoRepo.findById(id);
    } catch (error) {
      throw handleError(error);
    }
  }

  async listarVeiculos(empresaId?: string) {
    try {
      if (empresaId) {
        return await this.veiculoRepo.findByEmpresa(empresaId);
      }
      return await this.veiculoRepo.findAll();
    } catch (error) {
      throw handleError(error);
    }
  }

  async buscarPorEstado(estado: string, empresaId?: string) {
    try {
      return await this.veiculoRepo.findByEstadoVenda(estado, empresaId);
    } catch (error) {
      throw handleError(error);
    }
  }
}

export const estoqueService = new EstoqueService();
