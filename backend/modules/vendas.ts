import type { BackendOperation, OperationGroup } from "../types";
import type { PipelineSnapshotItem, SaleRecord } from "../fixtures";
import { pipelineSnapshot, salesRecords } from "../fixtures";
import { registerOperationGroup } from "../utils/operation-stub";

export const getPipelineSnapshot: BackendOperation<Record<string, never>, PipelineSnapshotItem[]> = {
  id: "vendas.getPipelineSnapshot",
  label: "Resumo do pipeline",
  domain: "vendas",
  kind: "query",
  source: {
    type: "table",
    name: "vendas",
    description: "SELECT status_venda, count(*) AS quantidade, avg(extract(day from now() - data_venda)) AS tempo_medio_dias FROM vendas GROUP BY status_venda"
  },
  frontend: [{ file: "app/app/vendas/page.tsx", surface: "Cards do funil" }],
  mock: async () => pipelineSnapshot
};

export const listOpenSales: BackendOperation<Record<string, never>, SaleRecord[]> = {
  id: "vendas.listOpenSales",
  label: "Vendas em andamento",
  domain: "vendas",
  kind: "query",
  source: {
    type: "table",
    name: "vendas",
    description: "SELECT * FROM vendas WHERE status_venda <> 'concluida' ORDER BY atualizado_em DESC"
  },
  frontend: [{ file: "app/app/vendas/page.tsx", surface: "Lista de negociações" }],
  mock: async () => salesRecords
};

export const createSale: BackendOperation<{ cliente_nome: string; veiculo_id: string; preco_venda: number }, { id: string }> = {
  id: "vendas.createSale",
  label: "Registrar venda",
  domain: "vendas",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_registrar_venda",
    description: "Função server-side para inserir registros em vendas com auditoria"
  },
  frontend: [{ file: "app/app/vendas/page.tsx", surface: "Botão Nova oportunidade" }],
  mock: async () => ({ id: "sale-mock" })
};

export const advanceSaleStage: BackendOperation<{ venda_id: string; proximo_status: string; usuario_id: string }, { venda_id: string; proximo_status: string }> = {
  id: "vendas.advanceSaleStage",
  label: "Avançar etapa",
  domain: "vendas",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_mudar_status_venda",
    description: "RPC para atualizar status da venda e registrar auditoria"
  },
  frontend: [{ file: "app/app/vendas/page.tsx", surface: "Botão Avançar etapa" }],
  mock: async ({ venda_id, proximo_status }) => ({ venda_id, proximo_status })
};

export const vendasOperations: OperationGroup = registerOperationGroup({
  getPipelineSnapshot,
  listOpenSales,
  createSale,
  advanceSaleStage
});
