import type { BackendOperation, OperationGroup } from "../types";
import type { MarketplaceSummary } from "../fixtures";
import { marketplaceSummaries } from "../fixtures";
import { registerOperationGroup } from "../utils/operation-stub";

export const listPlatformStatus: BackendOperation<Record<string, never>, MarketplaceSummary[]> = {
  id: "anuncios.listPlatformStatus",
  label: "Listar status por plataforma",
  domain: "anuncios",
  kind: "query",
  source: {
    type: "table",
    name: "plataformas",
    description:
      "SELECT p.id, p.nome, count(a.*) AS anuncios_publicados, max(a.atualizado_em) AS ultima_sincronizacao FROM plataformas p LEFT JOIN anuncios a ON a.plataforma_id = p.id GROUP BY p.id, p.nome"
  },
  frontend: [{ file: "app/app/anuncios/page.tsx", surface: "Cards de portais conectados" }],
  mock: async () => marketplaceSummaries
};

export const updatePlatform: BackendOperation<
  { plataforma_id: string; empresa_id: string; dados: Record<string, unknown> },
  { sucesso: boolean; plataforma_id: string }
> = {
  id: "anuncios.updatePlatform",
  label: "Atualizar metadados de plataforma",
  domain: "anuncios",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_plataformas",
    description: "RPC multiuso (criar/atualizar/apagar/listar) para plataformas"
  },
  frontend: [{ file: "app/app/anuncios/page.tsx", surface: "Ação Atualizar plataforma" }],
  mock: async ({ plataforma_id }) => ({ sucesso: true, plataforma_id })
};

export const anunciosOperations: OperationGroup = registerOperationGroup({
  listPlatformStatus,
  updatePlatform
});
