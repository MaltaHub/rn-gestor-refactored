import { supabase } from "@/lib/supabase";
import { listar_tabela } from "@/services";
import type { Empresa, MembroEmpresa } from "@/types";

export type UsuarioListado = {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string | null;
};

export async function listarEmpresasAdmin(): Promise<Empresa[]> {
  return listar_tabela("empresas");
}

export async function listarMembrosEmpresaAdmin(): Promise<MembroEmpresa[]> {
  return listar_tabela("membros_empresa");
}

export async function listarUsuarios(): Promise<UsuarioListado[]> {
  const { data, error } = await supabase.rpc("listar_usuarios");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UsuarioListado[];
}

export async function atualizarEmpresaDoMembro(
  membroId: string,
  novaEmpresaId: string,
): Promise<MembroEmpresa> {
  const { data, error } = await supabase
    .from("membros_empresa")
    .update({ empresa_id: novaEmpresaId })
    .eq("id", membroId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Não foi possível atualizar o membro da empresa.");
  }

  return data as MembroEmpresa;
}

export async function criarMembroEmpresa(
  usuarioId: string,
  empresaId: string,
  papel: MembroEmpresa["papel"] = "usuario",
): Promise<MembroEmpresa> {
  const { data, error } = await supabase
    .from("membros_empresa")
    .insert({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      papel,
      ativo: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Não foi possível criar o vínculo do usuário com a empresa.");
  }

  return data as MembroEmpresa;
}

export async function removerMembroEmpresa(membroId: string): Promise<void> {
  const { error } = await supabase
    .from("membros_empresa")
    .delete()
    .eq("id", membroId);

  if (error) {
    throw new Error(error.message);
  }
}

type CriarEmpresaPayload = {
  nome: string;
  dominio?: string | null;
};

export async function criarEmpresa({ nome, dominio }: CriarEmpresaPayload) {
  const trimmedNome = nome.trim();
  if (!trimmedNome) {
    throw new Error("Informe um nome para a empresa.");
  }

  const payload: { p_nome: string; p_dominio?: string } = { p_nome: trimmedNome };
  const trimmedDominio = dominio?.trim();
  if (trimmedDominio) {
    payload.p_dominio = trimmedDominio;
  }

  const { data, error } = await supabase.rpc("criar_empresa", payload);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
