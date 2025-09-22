"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, ClipboardList, Megaphone, Package, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

import type { DashboardChecklistItem, DashboardMetric, InventoryVehicle } from "../../../backend/fixtures";
import { getChecklist, getMetrics, getRecentVehicles } from "../../../backend/modules/dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { coreModules } from "@/data/modules";

const moduleActions = coreModules.slice(0, 4);

const metricIconMap: Record<string, { icon: typeof Package; tone: string }> = {
  "estoque-total": { icon: Package, tone: "text-sky-300" },
  "anuncios-ativos": { icon: Megaphone, tone: "text-indigo-300" },
  "vendas-mes": { icon: TrendingUp, tone: "text-emerald-300" },
  "promocoes-vigentes": { icon: BarChart3, tone: "text-amber-300" }
};

const checklistIconMap: Record<string, typeof ClipboardList> = {
  docs: ClipboardList,
  marketing: ShieldCheck,
  metas: TrendingUp
};

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [checklistItems, setChecklistItems] = useState<DashboardChecklistItem[]>([]);
  const [recentVehicles, setRecentVehicles] = useState<InventoryVehicle[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsRefreshing(true);
    const [metricsData, checklistData, vehiclesData] = await Promise.all([
      getMetrics.mock({}),
      getChecklist.mock({}),
      getRecentVehicles.mock({ limit: 3 })
    ]);
    setMetrics(metricsData);
    setChecklistItems(checklistData);
    setRecentVehicles(vehiclesData);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const formattedVehicles = useMemo(
    () =>
      recentVehicles.map((vehicle) => ({
        ...vehicle,
        formattedDate: new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
          new Date(vehicle.atualizado_em)
        )
      })),
    [recentVehicles]
  );

  const handleCreateVehicle = () => {
    router.push("/app/estoque?drawer=novo-veiculo");
  };

  const handleRefresh = () => {
    void loadDashboard();
  };

  const handleNavigate = (target: string) => {
    router.push(target);
  };

  const formatCurrency = (value: number | null) => {
    if (value == null) return "Sem preço";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "disponivel":
        return "Disponível";
      case "reservado":
        return "Reservado";
      case "em_preparacao":
        return "Em preparação";
      case "vendido":
        return "Vendido";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="Visão geral da operação"
        description="Cockpit pronto para receber dados reais e sustentar decisões rápidas."
        actions={
          <>
            <Button size="lg" className="gap-2" onClick={handleCreateVehicle}>
              <Plus className="h-4 w-4" />
              Novo veículo
            </Button>
            <Button variant="outline" size="lg" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? "Atualizando..." : "Atualizar painel"}
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ id, titulo, valor }) => {
          const IconDefinition = metricIconMap[id]?.icon ?? Package;
          const tone = metricIconMap[id]?.tone ?? "text-slate-300";
          return (
            <Card key={id} className="border-white/10 bg-slate-900/70">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-slate-300">{titulo}</CardTitle>
                <span className={`rounded-full bg-white/5 p-2 ${tone}`}>
                  <IconDefinition className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-white">{valor}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">Indicador chave</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Últimos veículos cadastrados</CardTitle>
              <CardDescription>Dados exibem os últimos registros retornados pela operação do estoque.</CardDescription>
            </div>
            <Button variant="ghost" className="gap-1 px-3 text-sm" onClick={() => handleNavigate("/app/estoque")}>
              Ver estoque
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {formattedVehicles.map(({ id, placa, modelo_nome, estado_venda, preco_venal, formattedDate }) => (
                <li
                  key={id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wide text-white">{placa}</p>
                    <p className="text-xs text-slate-400">
                      {modelo_nome} • {formatStatus(estado_venda)} • {formatCurrency(preco_venal)}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">{formattedDate}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader>
            <CardTitle>Checklist rápido</CardTitle>
            <CardDescription>Itens de monitoramento que aguardam automação.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {checklistItems.map(({ id, titulo, descricao }) => {
                const IconDefinition = checklistIconMap[id] ?? ClipboardList;
                return (
                  <li key={id} className="flex items-start gap-3 rounded-2xl bg-slate-950/40 p-3">
                    <span className="rounded-full bg-slate-800/80 p-2 text-sky-200">
                      <IconDefinition className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{titulo}</p>
                      <p className="text-xs text-slate-400">{descricao}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {moduleActions.map(({ name, summary, href, icon: Icon }) => (
          <Card key={href} className="border-white/5 bg-slate-900/80">
            <CardHeader className="gap-3">
              <CardTitle className="flex items-center gap-3 text-base text-white">
                <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
                  <Icon className="h-4 w-4" />
                </span>
                {name}
              </CardTitle>
              <CardDescription>{summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="gap-1 px-3 text-sm" onClick={() => handleNavigate(href)}>
                Acessar módulo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
