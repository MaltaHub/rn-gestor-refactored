/**
 * LojaRepository
 * Gerencia acesso a dados de lojas
 */

import { BaseRepository } from './base.repository';
import { Database } from '@/types/supabase';
import { RepositoryError } from './types';

type Loja = Database['public']['Tables']['lojas']['Row'];

export class LojaRepository extends BaseRepository<Loja> {
  constructor(supabase: unknown) {
    super(supabase as never, 'lojas');
  }

  async findByEmpresa(empresaId: string): Promise<Loja[]> {
    return this.findAll([
      { column: 'empresa_id', operator: 'eq', value: empresaId },
      { column: 'ativo', operator: 'eq', value: true },
    ]);
  }

  async findAtivas(): Promise<Loja[]> {
    return this.findAll([
      { column: 'ativo', operator: 'eq', value: true },
    ]);
  }
}
