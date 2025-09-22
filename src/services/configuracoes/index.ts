import { supabase } from "@/lib/supabaseClient"
import type { TableRow, TableInsert, TableUpdate } from "@/types"

export type LojaRecord = TableRow<"lojas">
export type LocalRecord = TableRow<"locais">
export type CaracteristicaRecord = TableRow<"caracteristicas">
export type ModeloRecord = TableRow<"modelos">

// Operações disponíveis no módulo configuração
const OPS = {
  lojas: "gerenciar_lojas",
  locais: "gerenciar_locais",
  caracteristicas: "gerenciar_caracteristicas",
  modelos: "gerenciar_modelos",
} as const

interface EmpresaScopedArgs {
  empresaId: string
}

interface CreateLojaArgs extends EmpresaScopedArgs {
  nome: string
}

interface UpdateLojaArgs extends EmpresaScopedArgs {
  lojaId: string
  dados: Pick<TableUpdate<"lojas">, "nome">
}

interface DeleteLojaArgs extends EmpresaScopedArgs {
  lojaId: string
}

interface CreateLocalArgs extends EmpresaScopedArgs {
  nome: string
}

interface UpdateLocalArgs extends EmpresaScopedArgs {
  localId: string
  dados: Pick<TableUpdate<"locais">, "nome">
}

interface DeleteLocalArgs extends EmpresaScopedArgs {
  localId: string
}

interface CreateCaracteristicaArgs extends EmpresaScopedArgs {
  nome: string
}

interface UpdateCaracteristicaArgs extends EmpresaScopedArgs {
  caracteristicaId: string
  dados: Pick<TableUpdate<"caracteristicas">, "nome">
}

interface DeleteCaracteristicaArgs extends EmpresaScopedArgs {
  caracteristicaId: string
}

interface CreateModeloArgs extends EmpresaScopedArgs {
  dados: Pick<TableInsert<"modelos">, "nome" | "marca" | "ano_inicial" | "ano_final">
}

interface UpdateModeloArgs extends EmpresaScopedArgs {
  modeloId: string
  dados: Pick<TableUpdate<"modelos">, "nome" | "marca" | "ano_inicial" | "ano_final">
}

interface DeleteModeloArgs extends EmpresaScopedArgs {
  modeloId: string
}

export class CompanyConfigurationsService {
  // --- utilitário interno para chamar executor ---
  private static async callExecutor<T>(
    operacao: string,
    payload: Record<string, any>
  ): Promise<T> {
    const { data, error } = await supabase.rpc("executor", {
      p_operacao: operacao,
      p_payload: payload,
    })
    if (error) throw error
    return data as T
  }

  // --- LOJAS ---
  static async listLojas({ empresaId }: EmpresaScopedArgs) {
    return this.callExecutor<LojaRecord[]>(OPS.lojas, {
      empresa_id: empresaId,
      operacao: "listar",
    })
  }

  static async createLoja({ empresaId, nome }: CreateLojaArgs) {
    return this.callExecutor(OPS.lojas, {
      empresa_id: empresaId,
      operacao: "criar",
      dados: { nome },
    })
  }

  static async updateLoja({ empresaId, lojaId, dados }: UpdateLojaArgs) {
    return this.callExecutor(OPS.lojas, {
      empresa_id: empresaId,
      operacao: "atualizar",
      alvo_id: lojaId,
      dados,
    })
  }

  static async deleteLoja({ empresaId, lojaId }: DeleteLojaArgs) {
    return this.callExecutor(OPS.lojas, {
      empresa_id: empresaId,
      operacao: "apagar",
      alvo_id: lojaId,
    })
  }

  // --- LOCAIS ---
  static async listLocais({ empresaId }: EmpresaScopedArgs) {
    return this.callExecutor<LocalRecord[]>(OPS.locais, {
      empresa_id: empresaId,
      operacao: "listar",
    })
  }

  static async createLocal({ empresaId, nome }: CreateLocalArgs) {
    return this.callExecutor(OPS.locais, {
      empresa_id: empresaId,
      operacao: "criar",
      dados: { nome },
    })
  }

  static async updateLocal({ empresaId, localId, dados }: UpdateLocalArgs) {
    return this.callExecutor(OPS.locais, {
      empresa_id: empresaId,
      operacao: "atualizar",
      alvo_id: localId,
      dados,
    })
  }

  static async deleteLocal({ empresaId, localId }: DeleteLocalArgs) {
    return this.callExecutor(OPS.locais, {
      empresa_id: empresaId,
      operacao: "apagar",
      alvo_id: localId,
    })
  }

  // --- CARACTERÍSTICAS ---
  static async listCaracteristicas({ empresaId }: EmpresaScopedArgs) {
    return this.callExecutor<CaracteristicaRecord[]>(OPS.caracteristicas, {
      empresa_id: empresaId,
      operacao: "listar",
    })
  }

  static async createCaracteristica({ empresaId, nome }: CreateCaracteristicaArgs) {
    return this.callExecutor(OPS.caracteristicas, {
      empresa_id: empresaId,
      operacao: "criar",
      dados: { nome },
    })
  }

  static async updateCaracteristica({ empresaId, caracteristicaId, dados }: UpdateCaracteristicaArgs) {
    return this.callExecutor(OPS.caracteristicas, {
      empresa_id: empresaId,
      operacao: "atualizar",
      alvo_id: caracteristicaId,
      dados,
    })
  }

  static async deleteCaracteristica({ empresaId, caracteristicaId }: DeleteCaracteristicaArgs) {
    return this.callExecutor(OPS.caracteristicas, {
      empresa_id: empresaId,
      operacao: "apagar",
      alvo_id: caracteristicaId,
    })
  }

  // --- MODELOS ---
  static async listModelos({ empresaId }: EmpresaScopedArgs) {
    return this.callExecutor<ModeloRecord[]>(OPS.modelos, {
      empresa_id: empresaId,
      operacao: "listar",
    })
  }

  static async createModelo({ empresaId, dados }: CreateModeloArgs) {
    return this.callExecutor(OPS.modelos, {
      empresa_id: empresaId,
      operacao: "criar",
      dados,
    })
  }

  static async updateModelo({ empresaId, modeloId, dados }: UpdateModeloArgs) {
    return this.callExecutor(OPS.modelos, {
      empresa_id: empresaId,
      operacao: "atualizar",
      alvo_id: modeloId,
      dados,
    })
  }

  static async deleteModelo({ empresaId, modeloId }: DeleteModeloArgs) {
    return this.callExecutor(OPS.modelos, {
      empresa_id: empresaId,
      operacao: "apagar",
      alvo_id: modeloId,
    })
  }
}
