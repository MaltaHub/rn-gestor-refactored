"use client";

import { useMemo } from "react";
import { ArrowRight, BarChart3, ClipboardList, Megaphone, Package, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { coreModules } from "@/data/modules";

const metrics = [
  {
    title: "Veículos em estoque",
    helper: "Organizados por status",
    value: 18,
    icon: Package,
    tone: "text-sky-300"
  },
  {
    title: "Anúncios ativos",
    helper: "Portais sincronizados",
    value: 12,
    icon: Megaphone,
    tone: "text-indigo-300"
  },
  {
    title: "Vendas no mês",
    helper: "Contratos fechados",
    value: 6,
    icon: TrendingUp,
    tone: "text-emerald-300"
  },
  {
    title: "Promoções vigentes",
    helper: "Campanhas em execução",
    value: 3,
    icon: BarChart3,
    tone: "text-amber-300"
  }
];

const checklist = [
  {
    title: "Documentação pendente",
    description: "Valide CRLV e laudos antes de liberar a venda.",
    icon: ClipboardList
  },
  {
    title: "Revisar campanhas",
    description: "Confirme valores e datas com marketing.",
    icon: ShieldCheck
  },
  {
    title: "Acompanhar metas",
    description: "Compare volume vendido com a meta semanal.",
    icon: TrendingUp
  }
];

const recentVehicles = [
  { placa: "ABC2D34", cor: "Azul metálico", estado: "Disponível", data: "2024-02-05" },
  { placa: "XYZ1H22", cor: "Branco perolizado", estado: "Reservado", data: "2024-02-03" },
  { placa: "KLM5P90", cor: "Preto sólido", estado: "Em preparação", data: "2024-02-01" }
];

const moduleActions = coreModules.slice(0, 4);

export default function DashboardPage() {
  const router = useRouter();

  const formattedVehicles = useMemo(
    () =>
      recentVehicles.map((vehicle) => ({
        ...vehicle,
        formattedDate: new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(vehicle.data))
      })),
    []
  );

  const handleCreateVehicle = () => {
    // action: iniciar fluxo de cadastro (ex: router.push para drawer ou abrir modal controlado)
    router.push("/app/estoque?drawer=novo-veiculo");
  };

  const handleRefresh = () => {
    // action: acoplar consulta ao serviço que atualiza métricas e listas
    console.info("Atualização do painel solicitada");
  };

  const handleNavigate = (target: string) => {
    // action: substituir por navegação + telemetria (ex: router.push e rastrear analytics)
    router.push(target);
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
            <Button variant="outline" size="lg" onClick={handleRefresh}>
              Atualizar painel
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ title, helper, value, icon: Icon, tone }) => (
          <Card key={title} className="border-white/10 bg-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-slate-300">{title}</CardTitle>
              <span className={`rounded-full bg-white/5 p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{value}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Últimos veículos cadastrados</CardTitle>
              <CardDescription>
                Exemplos de dados estáticos para conectar com o serviço de inventário.
              </CardDescription>
            </div>
            <Button variant="ghost" className="gap-1 px-3 text-sm" onClick={() => handleNavigate("/app/estoque")}>
              Ver estoque
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {formattedVehicles.map(({ placa, cor, estado, formattedDate }) => (
                <li
                  key={placa}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wide text-white">{placa}</p>
                    <p className="text-xs text-slate-400">
                      {cor} • {estado}
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
              {checklist.map(({ title, description, icon: Icon }) => (
                <li key={title} className="flex items-start gap-3 rounded-2xl bg-slate-950/40 p-3">
                  <span className="rounded-full bg-slate-800/80 p-2 text-sky-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                </li>
              ))}
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
