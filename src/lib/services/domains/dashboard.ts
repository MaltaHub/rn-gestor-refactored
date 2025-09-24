import { readClient } from "../core";
import type { DashboardMetrics, VehicleSummary } from "@/types/domain";

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  return readClient.fetch("dashboard.metricas");
}

export async function fetchUltimosVeiculos(): Promise<VehicleSummary[]> {
  return readClient.fetch("estoque.recentes", { limite: 6 });
}
