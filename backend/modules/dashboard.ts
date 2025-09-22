import type { BackendOperation, OperationGroup } from "../types";
import type { DashboardChecklistItem, DashboardMetric, InventoryVehicle } from "../fixtures";
import { dashboardChecklist, dashboardMetrics, inventoryVehicles } from "../fixtures";
import { registerOperationGroup } from "../utils/operation-stub";

export const getMetrics: BackendOperation<Record<string, never>, DashboardMetric[]> = {
  id: "dashboard.getMetrics",
  label: "Métricas do cockpit",
  domain: "dashboard",
  kind: "query",
  source: {
    type: "view",
    name: "dashboard_metricas",
    description: "View agregada com contadores estratégicos"
  },
  frontend: [{ file: "app/app/page.tsx", surface: "Cards de métricas" }],
  mock: async () => dashboardMetrics
};

export const getChecklist: BackendOperation<Record<string, never>, DashboardChecklistItem[]> = {
  id: "dashboard.getChecklist",
  label: "Checklist operacional",
  domain: "dashboard",
  kind: "query",
  source: {
    type: "view",
    name: "dashboard_checklist",
    description: "SELECT * FROM dashboard_checklist ORDER BY prioridade"
  },
  frontend: [{ file: "app/app/page.tsx", surface: "Checklist rápido" }],
  mock: async () => dashboardChecklist
};

export const getRecentVehicles: BackendOperation<{ limit?: number }, InventoryVehicle[]> = {
  id: "dashboard.getRecentVehicles",
  label: "Últimos veículos",
  domain: "dashboard",
  kind: "query",
  source: {
    type: "table",
    name: "veiculos",
    description: "SELECT v.*, m.nome AS modelo_nome FROM veiculos v LEFT JOIN modelos m ON m.id = v.modelo_id ORDER BY v.registrado_em DESC LIMIT :limit"
  },
  frontend: [{ file: "app/app/page.tsx", surface: "Lista Últimos veículos cadastrados" }],
  mock: async ({ limit = 3 }) => inventoryVehicles.slice(0, limit)
};

export const dashboardOperations: OperationGroup = registerOperationGroup({
  getMetrics,
  getChecklist,
  getRecentVehicles
});
