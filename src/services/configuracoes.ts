import { callRpc } from "@/lib/supabase";

type ConfiguracaoArea = "loja" | "plataforma" | "caracteristica" | "modelo" | "local";

type ConfiguracaoPayload = Record<string, unknown>;

const RPC_CONFIGURACOES = "rpc_configuracoes";

const extractId = (dados: ConfiguracaoPayload): string | undefined => {
  if (!("id" in dados)) return undefined;
  const value = (dados as { id?: unknown }).id;
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
};

export async function salvarConfiguracao(area: ConfiguracaoArea, dados: ConfiguracaoPayload): Promise<{ success: boolean }> {
  const operacao = `${area}/${extractId(dados) ? "atualizar" : "criar"}`;

  const response = await callRpc(RPC_CONFIGURACOES, {
    operacao,
    dados,
    id: extractId(dados),
  });

  return { success: response.status === "success" };
}

export async function remove(area: ConfiguracaoArea, id: string) {
  const operacao = `${area}/excluir`;
  const response = await callRpc(RPC_CONFIGURACOES, { operacao, id });

  return { success: response.status === "success" };
}
