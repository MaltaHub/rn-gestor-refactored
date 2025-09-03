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
  }
}
