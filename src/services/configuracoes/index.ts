import { supabase } from "@/lib/supabaseClient"
import type { TableInsert, TableRow, TableUpdate } from "@/types"

export type LojaRecord = TableRow<"lojas">
export type LocalRecord = TableRow<"locais">
export type CaracteristicaRecord = TableRow<"caracteristicas">
export type ModeloRecord = TableRow<"modelos">

const LOJAS_TABLE = "lojas"
const LOCAIS_TABLE = "locais"
const CARACTERISTICAS_TABLE = "caracteristicas"
const MODELOS_TABLE = "modelos"

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
  static async listLojas({ empresaId }: EmpresaScopedArgs) {
    const { data, error } = await supabase
      .from(LOJAS_TABLE)
      .select("id, nome")
      .eq("empresa_id", empresaId)
      .order("nome", { ascending: true })

    if (error) throw error
    return (data ?? []) as LojaRecord[]
  }

  static async createLoja({ empresaId, nome }: CreateLojaArgs) {
    const payload: TableInsert<"lojas"> = {
      empresa_id: empresaId,
      nome,
    }

    const { error } = await supabase.from(LOJAS_TABLE).insert(payload)
    if (error) throw error
  }

  static async updateLoja({ empresaId, lojaId, dados }: UpdateLojaArgs) {
    const { error } = await supabase
      .from(LOJAS_TABLE)
      .update(dados)
      .eq("empresa_id", empresaId)
      .eq("id", lojaId)

    if (error) throw error
  }

  static async deleteLoja({ empresaId, lojaId }: DeleteLojaArgs) {
    const { error } = await supabase
      .from(LOJAS_TABLE)
      .delete()
      .eq("empresa_id", empresaId)
      .eq("id", lojaId)

    if (error) throw error
  }

  static async listLocais({ empresaId }: EmpresaScopedArgs) {
    const { data, error } = await supabase
      .from(LOCAIS_TABLE)
      .select("id, nome")
      .eq("empresa_id", empresaId)
      .order("nome", { ascending: true })

    if (error) throw error
    return (data ?? []) as LocalRecord[]
  }

  static async createLocal({ empresaId, nome }: CreateLocalArgs) {
    const payload: TableInsert<"locais"> = {
      empresa_id: empresaId,
      nome,
    }

    const { error } = await supabase.from(LOCAIS_TABLE).insert(payload)
    if (error) throw error
  }

  static async updateLocal({ empresaId, localId, dados }: UpdateLocalArgs) {
    const { error } = await supabase
      .from(LOCAIS_TABLE)
      .update(dados)
      .eq("empresa_id", empresaId)
      .eq("id", localId)

    if (error) throw error
  }

  static async deleteLocal({ empresaId, localId }: DeleteLocalArgs) {
    const { error } = await supabase
      .from(LOCAIS_TABLE)
      .delete()
      .eq("empresa_id", empresaId)
      .eq("id", localId)

    if (error) throw error
  }

  static async listCaracteristicas({ empresaId }: EmpresaScopedArgs) {
    const { data, error } = await supabase
      .from(CARACTERISTICAS_TABLE)
      .select("id, nome")
      .eq("empresa_id", empresaId)
      .order("nome", { ascending: true })

    if (error) throw error
    return (data ?? []) as CaracteristicaRecord[]
  }

  static async createCaracteristica({ empresaId, nome }: CreateCaracteristicaArgs) {
    const payload: TableInsert<"caracteristicas"> = {
      empresa_id: empresaId,
      nome,
    }

    const { error } = await supabase.from(CARACTERISTICAS_TABLE).insert(payload)
    if (error) throw error
  }

  static async updateCaracteristica({
    empresaId,
    caracteristicaId,
    dados,
  }: UpdateCaracteristicaArgs) {
    const { error } = await supabase
      .from(CARACTERISTICAS_TABLE)
      .update(dados)
      .eq("empresa_id", empresaId)
      .eq("id", caracteristicaId)

    if (error) throw error
  }

  static async deleteCaracteristica({ empresaId, caracteristicaId }: DeleteCaracteristicaArgs) {
    const { error } = await supabase
      .from(CARACTERISTICAS_TABLE)
      .delete()
      .eq("empresa_id", empresaId)
      .eq("id", caracteristicaId)

    if (error) throw error
  }

  static async listModelos({ empresaId }: EmpresaScopedArgs) {
    const { data, error } = await supabase
      .from(MODELOS_TABLE)
      .select("id, nome, marca, ano_inicial, ano_final")
      .eq("empresa_id", empresaId)
      .order("nome", { ascending: true })

    if (error) throw error
    return (data ?? []) as ModeloRecord[]
  }

  static async createModelo({ empresaId, dados }: CreateModeloArgs) {
    const payload: TableInsert<"modelos"> = {
      empresa_id: empresaId,
      nome: dados.nome,
      marca: dados.marca,
      ano_inicial: dados.ano_inicial ?? null,
      ano_final: dados.ano_final ?? null,
    }

    const { error } = await supabase.from(MODELOS_TABLE).insert(payload)
    if (error) throw error
  }

  static async updateModelo({ empresaId, modeloId, dados }: UpdateModeloArgs) {
    const { error } = await supabase
      .from(MODELOS_TABLE)
      .update({
        nome: dados.nome,
        marca: dados.marca,
        ano_inicial: dados.ano_inicial ?? null,
        ano_final: dados.ano_final ?? null,
      })
      .eq("empresa_id", empresaId)
      .eq("id", modeloId)

    if (error) throw error
  }

  static async deleteModelo({ empresaId, modeloId }: DeleteModeloArgs) {
    const { error } = await supabase
      .from(MODELOS_TABLE)
      .delete()
      .eq("empresa_id", empresaId)
      .eq("id", modeloId)

    if (error) throw error
  }
}
