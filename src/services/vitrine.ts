import { supabase } from "@/lib/supabase";
import type { VeiculoLoja } from "@/types";

type AdicionarPayload = {
  empresaId: string;
  lojaId: string;
  veiculoId: string;
  preco?: number | null;
  dataEntrada?: string;
};

export async function adicionarVeiculoLoja({
  empresaId,
  lojaId,
  veiculoId,
  preco = null,
  dataEntrada,
}: AdicionarPayload): Promise<VeiculoLoja> {
  const entrada = dataEntrada ?? new Date().toISOString();

  const { data, error } = await supabase
    .from("veiculos_loja")
    .insert({
      empresa_id: empresaId,
      loja_id: lojaId,
      veiculo_id: veiculoId,
      preco,
      data_entrada: entrada,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as VeiculoLoja;
}

export async function removerVeiculoLoja(veiculoLojaId: string) {
  const { error } = await supabase
    .from("veiculos_loja")
    .delete()
    .eq("id", veiculoLojaId);

  if (error) {
    throw error;
  }
}

export async function atualizarPrecoVeiculoLoja(
  veiculoLojaId: string,
  preco: number | null,
) {
  const { error } = await supabase
    .from("veiculos_loja")
    .update({ preco })
    .eq("id", veiculoLojaId);

  if (error) throw error;
}
