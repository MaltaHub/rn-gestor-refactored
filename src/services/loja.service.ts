/**
 * LojaService - Nova camada usando Repository Pattern
 */

import { supabase } from '@/lib/supabase-client';
import { LojaRepository } from '@/repositories';
import { handleError } from '@/lib/errors';
import { Database } from '@/types/supabase';

type LojaInsert = Database['public']['Tables']['lojas']['Insert'];
type LojaUpdate = Database['public']['Tables']['lojas']['Update'];

export class LojaService {
  private lojaRepo: LojaRepository;

  constructor() {
    this.lojaRepo = new LojaRepository(supabase);
  }

  async criarLoja(dados: LojaInsert) {
    try {
      return await this.lojaRepo.create(dados);
    } catch (error) {
      throw handleError(error);
    }
  }

  async atualizarLoja(id: string, dados: LojaUpdate) {
    try {
      return await this.lojaRepo.update(id, dados);
    } catch (error) {
      throw handleError(error);
    }
  }

  async deletarLoja(id: string) {
    try {
      await this.lojaRepo.delete(id);
    } catch (error) {
      throw handleError(error);
    }
  }

  async buscarLojaPorId(id: string) {
    try {
      return await this.lojaRepo.findById(id);
    } catch (error) {
      throw handleError(error);
    }
  }

  async listarLojas(empresaId?: string) {
    try {
      if (empresaId) {
        return await this.lojaRepo.findByEmpresa(empresaId);
      }
      return await this.lojaRepo.findAtivas();
    } catch (error) {
      throw handleError(error);
    }
  }

  async listarLojasAtivas() {
    try {
      return await this.lojaRepo.findAtivas();
    } catch (error) {
      throw handleError(error);
    }
  }
}

export const lojaService = new LojaService();
