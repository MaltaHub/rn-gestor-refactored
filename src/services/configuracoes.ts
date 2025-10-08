import { callRpc } from "@/lib/supabase";
import { RPC_FUNCTIONS } from "@/config";

type ConfiguracaoArea =
  | "loja"
  | "plataforma"
  | "caracteristica"
  | "modelo"
  | "local"
  | "unidade_loja";

type ConfiguracaoPayload = Record<string, unknown>;

const extractId = (dados: ConfiguracaoPayload): string | undefined => {
  if (!("id" in dados)) return undefined;
  const value = (dados as { id?: unknown }).id;
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
};

export async function salvarConfiguracao(area: ConfiguracaoArea, dados: ConfiguracaoPayload): Promise<{ success: boolean }> {
  const id = extractId(dados);
  const operacao = `${area}/${id ? "atualizar" : "criar"}`;

  const response = await callRpc(RPC_FUNCTIONS.CONFIGURACOES, {
    operacao,
    dados,
    id,
  });

  return { success: response.status === "success" };
}

export async function remove(area: ConfiguracaoArea, id: string) {
  const operacao = `${area}/excluir`;
  const response = await callRpc(RPC_FUNCTIONS.CONFIGURACOES, { operacao, id });

  return { success: response.status === "success" };
}
