"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGlobalLojaId } from "@/hooks/use-loja";
import { vendasService } from "@/lib/services/domains";
import type { AnaliseComparativa, PipelineResumo, VendaResumo } from "@/types/domain";

interface FiltrosVendas {
  status?: string;
  periodoInicio?: string;
  periodoFim?: string;
}

export default function SalesPage() {
  const router = useRouter();
  const lojaId = useGlobalLojaId();
  const [insights, setInsights] = useState<{ total?: number; ticketMedio?: number }>({});
  const [pipeline, setPipeline] = useState<PipelineResumo[]>([]);
  const [analises, setAnalises] = useState<AnaliseComparativa[]>([]);
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [filtros, setFiltros] = useState<FiltrosVendas>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { status, periodoInicio, periodoFim } = filtros;

  const carregarPainel = useCallback(async () => {
    setIsLoading(true);
    try {
      const filtrosComLoja = {
        lojaId: lojaId || undefined,
        status: status || undefined,
        periodoInicio: periodoInicio || undefined,
        periodoFim: periodoFim || undefined
      };
      const [dadosInsights, dadosPipeline, vendasRecentes, analisesComparativas] = await Promise.all([
        vendasService.obterInsights(filtrosComLoja),
        vendasService.listarPipeline(filtrosComLoja),
        vendasService.listarVendasRecentes(filtrosComLoja),
        vendasService.listarAnalisesComparativas(filtrosComLoja)
      ]);
      setInsights({ total: dadosInsights.totalVendas, ticketMedio: dadosInsights.ticketMedio });
      setPipeline(dadosPipeline);
      setVendas(vendasRecentes);
      setAnalises(analisesComparativas);
    } catch (error) {
      console.error("Falha ao carregar vendas", error);
      setFeedback("Não foi possível carregar o painel de vendas.");
    } finally {
      setIsLoading(false);
    }
  }, [lojaId, periodoFim, periodoInicio, status]);

  useEffect(() => {
    void carregarPainel();
  }, [carregarPainel]);

  const handleNovaVenda = async () => {
    if (!lojaId) return;
    try {
      const resultado = await vendasService.registrarVenda(
        { clienteNome: "Cliente piloto", veiculoId: "veh-001", precoVenda: 0, status: "negociacao" },
        lojaId
      );
      setFeedback(`Venda registrada com ID ${resultado.vendaId}.`);
      await carregarPainel();
    } catch (error) {
      console.error("Erro ao registrar venda", error);
      setFeedback("Não foi possível registrar a venda.");
    }
  };

  const handleFiltroSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void carregarPainel();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão de vendas"
        description="Pipeline organizado para conectar ao CRM e acelerar decisões."
        actions={
          <Button className="gap-2" onClick={handleNovaVenda} disabled={!lojaId || isLoading}>
            <Plus className="h-4 w-4" />
            Nova oportunidade
          </Button>
        }
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Controle o período e status para refinar os resultados.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4" onSubmit={handleFiltroSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="status">
                Status
              </label>
              <Input
                id="status"
                value={filtros.status ?? ""}
                onChange={(event) => setFiltros((prev) => ({ ...prev, status: event.target.value }))}
                placeholder="Ex.: negociacao"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="inicio">
                Início
              </label>
              <Input
                id="inicio"
                type="date"
                value={filtros.periodoInicio ?? ""}
                onChange={(event) => setFiltros((prev) => ({ ...prev, periodoInicio: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="fim">
                Fim
              </label>
              <Input
                id="fim"
                type="date"
                value={filtros.periodoFim ?? ""}
                onChange={(event) => setFiltros((prev) => ({ ...prev, periodoFim: event.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isLoading}>
                Aplicar
              </Button>
            </div>
          </form>
          {feedback ? <p className="mt-4 text-xs text-slate-400">{feedback}</p> : null}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle>Pipeline</CardTitle>
          <CardDescription>Resumo das etapas com base nos dados retornados.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {pipeline.map(({ etapa, quantidade }) => (
            <div key={etapa} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{etapa}</p>
              <p className="text-3xl font-semibold text-white">{quantidade}</p>
            </div>
          ))}
          {pipeline.length === 0 ? <p className="text-xs text-slate-400">Nenhum dado de pipeline para o filtro atual.</p> : null}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader>
          <CardTitle>Negócios em andamento</CardTitle>
          <CardDescription>Registros retornados pelo serviço de vendas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vendas.map(({ id, clienteNome, veiculoId, precoVenda, status, atualizadoEm }) => (
              <div
                key={id}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{clienteNome}</p>
                  <p className="text-xs text-slate-400">{veiculoId}</p>
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-500 sm:text-sm">
                  <span>{precoVenda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  <span className="text-sky-200 text-xs uppercase tracking-[0.2em]">{status}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Atualizado {atualizadoEm ? new Date(atualizadoEm).toLocaleString("pt-BR") : "recentemente"}
                </div>
                <Button variant="outline" className="gap-2 text-xs md:text-sm" onClick={() => router.push(`/app/vendas/${id}`)}>
                  Abrir detalhe
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {vendas.length === 0 ? <p className="text-sm text-slate-400">Nenhuma venda encontrada.</p> : null}
          </div>
      </CardContent>
    </Card>

    <Card className="border-white/10 bg-slate-900/70">
      <CardHeader className="gap-3">
        <CardTitle>Análises comparativas</CardTitle>
        <CardDescription>Resultados de `vendas.analisesComparativas` para orientar decisões.</CardDescription>
      </CardHeader>
      <CardContent>
        {analises.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma análise disponível para os filtros aplicados.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {analises.map(({ label, valor, variacao }) => (
              <div key={label} className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="text-2xl font-semibold text-white">{valor}</p>
                {variacao != null ? (
                  <p className={`text-xs ${variacao >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {variacao >= 0 ? "+" : ""}
                    {variacao}% vs. período anterior
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <Card className="border-white/5 bg-slate-900/80">
      <CardHeader className="gap-3">
          <CardTitle>Indicadores complementares</CardTitle>
          <CardDescription>Valores provenientes de insights consolidados.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total de vendas</p>
            <p className="text-2xl font-semibold text-white">{insights.total ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ticket médio</p>
            <p className="text-2xl font-semibold text-white">
              {insights.ticketMedio
                ? insights.ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : "R$ 0,00"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
