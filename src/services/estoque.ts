import { Database } from "@/types/supabase";
import { callRpc } from "@/lib/supabase";

type Veiculo = Database["public"]["Tables"]["veiculos"]["Row"];
export type CaracteristicaPayload = { id: string; nome: string };

type VeiculoCreatePayload = Partial<Veiculo> & {
  caracteristicas?: CaracteristicaPayload[];
};

export type VeiculoUpdatePayload = Partial<Veiculo> & {
  adicionar_caracteristicas?: CaracteristicaPayload[];
  remover_caracteristicas?: CaracteristicaPayload[];
};

const RPC_VEICULOS = "rpc_veiculos";

const uniqueById = (items: CaracteristicaPayload[] = []) => {
  const map = new Map<string, CaracteristicaPayload>();
  for (const item of items) {
    if (!item?.id) continue;
    if (!map.has(item.id)) {
      map.set(item.id, { id: item.id, nome: item.nome });
    }
  }
  return Array.from(map.values());
};

export function calcularDiffCaracteristicas(
  anteriores: CaracteristicaPayload[] = [],
  atuais: CaracteristicaPayload[] = [],
) {
  const anterioresUnicos = uniqueById(anteriores);
  const atuaisUnicos = uniqueById(atuais);

  const atuaisMap = new Map(atuaisUnicos.map((item) => [item.id, item]));
  const anterioresMap = new Map(anterioresUnicos.map((item) => [item.id, item]));

  const adicionar = atuaisUnicos.filter((item) => !anterioresMap.has(item.id));
  const remover = anterioresUnicos.filter((item) => !atuaisMap.has(item.id));

  return {
    adicionar,
    remover,
  };
}

export async function criarVeiculo(dados: VeiculoCreatePayload) {
  return callRpc(RPC_VEICULOS, { operacao: "criar", dados });
}

export async function atualizarVeiculo(id: string, dados: VeiculoUpdatePayload) {
  const { adicionar_caracteristicas, remover_caracteristicas, ...resto } = dados;

  const payload = {
    ...resto,
    adicionar_caracteristicas: adicionar_caracteristicas ?? [],
    remover_caracteristicas: remover_caracteristicas ?? [],
  } satisfies VeiculoUpdatePayload;

  return callRpc(RPC_VEICULOS, {
    operacao: "atualizar",
    dados: payload,
    id,
  });
}

export async function deletarVeiculo(id: string) {
  return callRpc(RPC_VEICULOS, { operacao: "excluir", id });
}
