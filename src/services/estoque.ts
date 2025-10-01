import { callRpc } from "@/lib/supabase";
import type { Veiculo } from "@/types/estoque";

const RPC_VEICULOS = "rpc_veiculos";

export async function criarVeiculo(dados: Partial<Veiculo>) {
  return callRpc(RPC_VEICULOS, { operacao: "criar", dados });
}

export async function atualizarVeiculo(id: string, dados: Partial<Veiculo>) {
  return callRpc(RPC_VEICULOS, { operacao: "atualizar", dados, id_alvo: id });
}

export async function deletarVeiculo(id: string) {
  return callRpc(RPC_VEICULOS, { operacao: "deletar", id_alvo: id });
}
