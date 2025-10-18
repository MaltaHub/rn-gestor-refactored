import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type VendaRow = Database["public"]["Tables"]["vendas"]["Row"];
type VendaInsert = Database["public"]["Tables"]["vendas"]["Insert"];
type VendaStatus = Database["public"]["Enums"]["status_venda"];

type VendaComRelacionamentos = VendaRow & {
  veiculo?: {
    id: string;
    placa: string | null;
    modelo?: {
      id: string;
      nome: string | null;
    } | null;
  } | null;
  loja?: {
    id: string;
    nome: string;
  } | null;
};

export interface ListarVendasParams {
  empresaId: string;
  vendedorId?: string | null;
}

export async function listarVendas({
  empresaId,
  vendedorId,
}: ListarVendasParams): Promise<VendaComRelacionamentos[]> {
  let query = supabase
    .from("vendas")
    .select(
      `
        *,
        veiculo: veiculos (
          id,
          placa,
          modelo: modelos (
            id,
            nome
          )
        ),
        loja: lojas (
          id,
          nome
        )
      `
    )
    .eq("empresa_id", empresaId)
    .order("data_venda", { ascending: false });

  if (vendedorId) {
    query = query.eq("vendedor_id", vendedorId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as VendaComRelacionamentos[];
}

export async function buscarVenda(
  id: string,
  empresaId: string
): Promise<VendaComRelacionamentos> {
  const { data, error } = await supabase
    .from("vendas")
    .select(
      `
        *,
        veiculo: veiculos (
          id,
          placa,
          modelo: modelos (
            id,
            nome
          )
        ),
        loja: lojas (
          id,
          nome
        )
      `
    )
    .eq("empresa_id", empresaId)
    .eq("id", id)
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error("Venda não encontrada");
  }

  return data as VendaComRelacionamentos;
}

export async function registrarVenda(payload: VendaInsert): Promise<VendaRow> {
  const { data, error } = await supabase
    .from("vendas")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as VendaRow;
}

export interface AtualizarStatusPayload {
  vendaId: string;
  status: VendaStatus;
  usuarioId?: string | null;
  dataEntrega?: string | null;
  observacoes?: string | null;
}

export async function atualizarStatusVenda({
  vendaId,
  status,
  usuarioId,
  dataEntrega,
  observacoes,
}: AtualizarStatusPayload): Promise<void> {
  const { error } = await supabase
    .from("vendas")
    .update({
      status_venda: status,
      atualizado_em: new Date().toISOString(),
      atualizado_por: usuarioId ?? undefined,
      data_entrega: typeof dataEntrega === "string" ? dataEntrega : undefined,
      observacoes: typeof observacoes === "string" ? observacoes : undefined,
    })
    .eq("id", vendaId);

  if (error) throw error;
}
