import { supabase } from "@/lib/supabaseClient";
import type { TableInsert, TableUpdate, TableRow } from "@/types";
import type { Json } from "@/types/supabase";

export type VehicleRecord = TableRow<"veiculos">;
export type VehicleInsertInput = Omit<TableInsert<"veiculos">, "empresa_id">;
export type VehicleUpdateInput = TableUpdate<"veiculos">;

const VEHICLES_TABLE = "veiculos";

const toJson = (data: unknown): Json =>
  JSON.parse(JSON.stringify(data)) as Json;

interface BaseVehicleArgs {
  empresaId: string;
}

interface CreateVehicleArgs extends BaseVehicleArgs {
  usuarioId?: string;
  dados: VehicleInsertInput;
  caracteristicasIds?: string[];
}

interface UpdateVehicleArgs extends BaseVehicleArgs {
  usuarioId: string;
  veiculoId: string;
  dados: VehicleUpdateInput;
}

interface RemoveVehicleArgs extends BaseVehicleArgs {
  veiculoId: string;
  motivo?: string;
}

export class VehiclesService {
  static async list({ empresaId }: BaseVehicleArgs) {
    const { data, error } = await supabase
      .from(VEHICLES_TABLE)
      .select("*")
      .eq("empresa_id", empresaId)
      .order("registrado_em", { ascending: false });

    if (error) throw error;
    return data satisfies VehicleRecord[];
  }

  static async create({
    empresaId,
    usuarioId,
    dados,
    caracteristicasIds,
  }: CreateVehicleArgs) {
    const payload = {
      p_empresa_id: empresaId,
      p_usuario_id: usuarioId,
      p_dados_veiculo: toJson(dados),
      p_caracteristicas: caracteristicasIds ?? undefined,
    } as const;

    const { data, error } = await supabase.rpc("cadastrar_veiculo", payload);
    if (error) throw error;
    return data;
  }

  static async update({ empresaId, usuarioId, veiculoId, dados }: UpdateVehicleArgs) {
    const payload = {
      p_empresa_id: empresaId,
      p_usuario_id: usuarioId,
      p_veiculo_id: veiculoId,
      p_dados_atualizacao: toJson(dados),
    } as const;

    const { data, error } = await supabase.rpc("atualizar_veiculo", payload);
    if (error) throw error;
    return data;
  }

  static async remove({ empresaId, veiculoId, motivo }: RemoveVehicleArgs) {
    const payload = {
      p_empresa_id: empresaId,
      p_operacao: "remover",
      p_veiculo_id: veiculoId,
      p_dados_veiculo: motivo ? toJson({ motivo }) : null,
    } as const;

    const { data, error } = await supabase.rpc("gerenciar_veiculos", payload);
    if (error) throw error;
    return data;
  }
}
