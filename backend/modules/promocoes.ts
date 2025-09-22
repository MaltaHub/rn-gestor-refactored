import type { BackendOperation, OperationGroup } from "../types";
import type { PromotionRecord } from "../fixtures";
import { promotionRecords } from "../fixtures";
import { registerOperationGroup } from "../utils/operation-stub";

export const listPromotions: BackendOperation<{ ativo?: boolean }, PromotionRecord[]> = {
  id: "promocoes.listPromotions",
  label: "Listar promoções",
  domain: "promocoes",
  kind: "query",
  source: {
    type: "table",
    name: "promocoes",
    description: "SELECT * FROM promocoes WHERE (:ativo::boolean IS NULL OR ativo = :ativo) ORDER BY data_inicio DESC"
  },
  frontend: [{ file: "app/app/promocoes/page.tsx", surface: "Cards de campanhas" }],
  mock: async ({ ativo } = {}) =>
    typeof ativo === "boolean" ? promotionRecords.filter((promo) => promo.ativo === ativo) : promotionRecords
};

export const togglePromotion: BackendOperation<{ promocao_id: string; usuario_id: string }, { promocao_id: string; ativo: boolean }> = {
  id: "promocoes.togglePromotion",
  label: "Alternar promoção",
  domain: "promocoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_promocoes",
    description: "RPC para ativar/desativar promoções com auditoria"
  },
  frontend: [{ file: "app/app/promocoes/page.tsx", surface: "Botão Alternar status" }],
  mock: async ({ promocao_id }) => ({ promocao_id, ativo: true })
};

export const createPromotion: BackendOperation<
  { veiculo_loja_id?: string; anuncio_id?: string; tipo_promocao: string; preco_promocional: number; data_inicio: string; data_fim?: string | null; usuario_id: string },
  { id: string }
> = {
  id: "promocoes.createPromotion",
  label: "Criar promoção",
  domain: "promocoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_criar_promocao",
    description: "Valida regras comerciais e insere registro na tabela promocoes"
  },
  frontend: [{ file: "app/app/promocoes/page.tsx", surface: "Botão Nova campanha" }],
  mock: async () => ({ id: "promo-mock" })
};

export const schedulePromotion: BackendOperation<{ promocao_id: string; run_at: string; usuario_id: string }, { promocao_id: string; run_at: string }> = {
  id: "promocoes.schedulePromotion",
  label: "Agendar ativação",
  domain: "promocoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_agendar_promocao",
    description: "Insere agenda em promocoes_agendamentos"
  },
  frontend: [{ file: "app/app/promocoes/page.tsx", surface: "Botão Agendar nova janela" }],
  mock: async ({ promocao_id, run_at }) => ({ promocao_id, run_at })
};

export const promocoesOperations: OperationGroup = registerOperationGroup({
  listPromotions,
  togglePromotion,
  createPromotion,
  schedulePromotion
});
