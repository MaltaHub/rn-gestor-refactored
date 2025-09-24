"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Megaphone, Package, Plus, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { coreModules } from "@/data/modules";
import { avisosService, dashboardService } from "@/lib/services/domains";
import type { AvisoPendencia, DashboardMetrics, VehicleSummary } from "@/types/domain";

const moduleActions = coreModules.slice(0, 4);

const metricIconMap: Record<string, { icon: typeof Package; tone: string }> = {
  estoque: { icon: Package, tone: "text-sky-300" },
  anuncios: { icon: Megaphone, tone: "text-indigo-300" },
  vendas: { icon: TrendingUp, tone: "text-emerald-300" }
};

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentVehicles, setRecentVehicles] = useState<VehicleSummary[]>([]);
  const [avisos, setAvisos] = useState<AvisoPendencia[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    void carregarPainel();
  }, []);

  const carregarPainel = async () => {
    setIsRefreshing(true);
    try {
      const [dadosMetricas, veiculos, pendencias] = await Promise.all([
        dashboardService.fetchDashboardMetrics(),
        dashboardService.fetchUltimosVeiculos(),
        avisosService.listarAvisos()
      ]);
      setMetrics(dadosMetricas);
      setRecentVehicles(veiculos);
      setAvisos(pendencias);
    } catch (error) {
      console.error("Falha ao carregar painel", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formattedVehicles = useMemo(
    () =>
      recentVehicles.map((vehicle) => ({
        ...vehicle,
        formattedDate: vehicle.anuncioAtualizadoEm
          ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(vehicle.anuncioAtualizadoEm))
          : "Atualização recente",
        priceLabel: vehicle.precoAnuncio ?? vehicle.precoVenal ?? 0
      })),
    [recentVehicles]
  );

  const handleCreateVehicle = () => {
    router.push("/app/estoque?drawer=novo-veiculo");
  };

  const handleNavigate = (target: string) => {
    router.push(target);
  };

  const metricCards = metrics?.cards ?? [];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Visão geral da operação"
        description="Cockpit pronto para receber dados reais e sustentar decisões rápidas."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" onClick={handleCreateVehicle}>
              <Plus className="h-4 w-4" />
              Novo veículo
            </Button>
            <Button variant="outline" size="lg" onClick={carregarPainel} disabled={isRefreshing}>
              {isRefreshing ? "Atualizando..." : "Atualizar painel"}
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ id, label, value, trend, trendValue }) => {
          const iconDef = metricIconMap[id] ?? metricIconMap.estoque;
          return (
            <Card key={id} className="border-white/10 bg-slate-900/70">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-slate-300">{label}</CardTitle>
                <span className={`rounded-full bg-white/5 p-2 ${iconDef.tone}`}>
                  <iconDef.icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-3xl font-semibold text-white">{value}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {trend === "up" && trendValue ? `Em alta ${trendValue}` : trend === "down" && trendValue ? `Em queda ${trendValue}` : "Indicador chave"}
                </p>
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
              <CardDescription>Dados exibem os registros mais recentes retornados pelo estoque.</CardDescription>
            </div>
            <Button variant="ghost" className="gap-1 px-3 text-sm" onClick={() => handleNavigate("/app/estoque")}>
              Ver estoque
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {formattedVehicles.map(({ id, placa, modeloMarca, modeloNome, priceLabel, formattedDate }) => (
                <li
                  key={id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wide text-white">{placa}</p>
                    <p className="text-xs text-slate-400">
                      {[modeloMarca, modeloNome].filter(Boolean).join(" ") || "Modelo não informado"} •
                      {" "}
                      {priceLabel ? priceLabel.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Sem preço"}
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
            <CardTitle>Pendências operacionais</CardTitle>
            <CardDescription>Itens que aguardam ação e podem gerar alertas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {avisos.map(({ id, descricao, lojaId }) => (
                <li key={id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
                  <p className="font-semibold text-slate-100">{descricao}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Loja: {lojaId}</p>
                </li>
              ))}
              {avisos.length === 0 ? (
                <li className="text-xs text-slate-400">Nenhuma pendência sinalizada.</li>
              ) : null}
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
              <Button variant="outline" className="gap-2" onClick={() => handleNavigate(href)}>
                Abrir módulo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
