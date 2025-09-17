import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types";
import type { Json } from "@/types/supabase";

export type CompanyInvite = Database["public"]["Tables"]["convites_empresa"]["Row"] & {
  empresas?: { nome: string } | null;
};

const toJson = (value: unknown): Json => JSON.parse(JSON.stringify(value)) as Json;

export type PapelEmpresa = Database["public"]["Enums"]["papel_usuario_empresa"];

export async function createCompany(args: { nome: string; dominio?: string | null; usuarioId?: string }) {
  const payload = {
    p_nome: args.nome,
    p_dominio: args.dominio ?? undefined,
    p_usuario_proprietario_id: args.usuarioId,
  } as const;

  const { data, error } = await supabase.rpc("criar_empresa", payload);
  if (error) throw error;
  return data;
}

export async function inviteMember(args: { empresaId: string; email: string; papel: PapelEmpresa; convidadoPor: string }) {
  const payload = {
    p_empresa_id: args.empresaId,
    p_operacao: "criar_convite",
    p_dados_membro: toJson({ email: args.email, papel: args.papel, convidado_por: args.convidadoPor }),
  } as const;

  const { data, error } = await supabase.rpc("gerenciar_membros", payload);
  if (error) throw error;
  return data;
}

export async function fetchInvites(usuarioId: string) {
  const { data, error } = await supabase
    .from("convites_empresa")
    .select("id, empresa_id, status, expira_em, criado_em, token, empresas ( nome )")
    .eq("usuario_convidado_id", usuarioId)
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CompanyInvite[];
}

export async function acceptInvite(args: { empresaId: string; token: string }) {
  const { data, error } = await supabase.rpc("gerenciar_membros", {
    p_empresa_id: args.empresaId,
    p_operacao: "aceitar_convite",
    p_dados_membro: toJson({ token: args.token }),
  });

  if (error) throw error;
  return data;
}
