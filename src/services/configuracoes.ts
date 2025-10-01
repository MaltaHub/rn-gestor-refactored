import { callRpc } from "@/lib/supabase";

type ConfiguracaoArea = "loja" | "plataforma" | "caracteristica" | "modelo" | "local";

const RPC_CONFIGURACOES = "rpc_configuracoes";

export async function salvarConfiguracao(area: ConfiguracaoArea, dados: any): Promise<{ success: boolean }> {

  const tipo = area
  const operacao = `${tipo}/${dados?.id ? "atualizar" : "criar"}`;
  console.log("Salvando configuração:", { operacao, dados });

  const response = callRpc({
    rpc: RPC_CONFIGURACOES,
    p_payload: { operacao: operacao, dados: dados, id: dados?.id }
  });

  if ((await response).status === "success") {
    return { success: true };
  }

  return { success: false };
}

export async function remove(area: ConfiguracaoArea, id: string) {
  const tipo = area
  const operacao = `${tipo}/excluir`;
  const response = callRpc({
    rpc: RPC_CONFIGURACOES,
    p_payload: { operacao: operacao, id: id, dados: { area } }
  });

  if ((await response).status === "success") {
    return { success: true };
  }

  return { success: false };
}