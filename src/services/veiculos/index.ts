<<<<<<< HEAD
﻿import { supabase } from "@/lib/supabaseClient";
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
=======
import { supabase } from "../../lib/supabaseClient";
import { Tabelas } from "../../types";

type Veiculo = Tabelas.Veiculo;
type VeiculoUpload = Tabelas.VeiculoUpload;

export class Veiculos {
  static async fetchAll(): Promise<{ vehicles: Veiculo[] }> {
    const { data, error } = await supabase
      .from("veiculos")
      .select<"*", Veiculo>("*");

    if (error) {
      throw error;
    }

    // ⚠️ se quiser transformar string -> Date
    const vehicles = (data ?? []).map((v) => ({
      ...v,
      registrado_em: new Date(v.registrado_em),
      editado_em: new Date(v.editado_em),
    }));

    return { vehicles };
  }

  static async create(payload: VeiculoUpload): Promise<Veiculo> {
    const { data, error } = await supabase
      .from("veiculos")
      .insert([payload])
      .select<"*", Veiculo>()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      registrado_em: new Date(data.registrado_em),
      editado_em: new Date(data.editado_em),
    };
  }

  static async update(id: string, payload: Partial<VeiculoUpload>): Promise<Veiculo> {
    const { data, error } = await supabase
      .from("veiculos")
      .update(payload)
      .eq("id", id)
      .select<"*", Veiculo>()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      registrado_em: new Date(data.registrado_em),
      editado_em: new Date(data.editado_em),
    };
  }

  static async remove(id: string): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from("veiculos")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return { success: true };
>>>>>>> 4a9cd9a764550d3359743d5484686b69da2b76a3
  }
}
