"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, Clock, Plus } from "lucide-react";

import type { PipelineSnapshotItem, SaleRecord } from "../../../../backend/fixtures";
import {
  advanceSaleStage,
  createSale,
  getPipelineSnapshot,
  listOpenSales
} from "../../../../backend/modules/vendas";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalesPage() {
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<PipelineSnapshotItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      const [pipelineData, salesData] = await Promise.all([
        getPipelineSnapshot.mock({}),
        listOpenSales.mock({})
      ]);

      if (!cancelled) {
        setPipeline(pipelineData);
        setSales(salesData);
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleNewSale = async () => {
    const newSale = await createSale.mock({
      cliente_nome: "Cliente piloto",
      veiculo_id: "veh-mock",
      preco_venda: 0
    });
    console.info("Nova venda", newSale);
  };

  const handleAdvanceStage = async (saleId: string, nextStage: string) => {
    const updated = await advanceSaleStage.mock({ venda_id: saleId, proximo_status: nextStage, usuario_id: "user-1" });
    console.info("Avançar etapa", updated);
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "negociacao":
        return "Negociação";
      case "proposta":
        return "Proposta";
      case "contrato":
        return "Contrato";
      case "concluida":
        return "Concluída";
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão de vendas"
        description="Pipeline organizado para conectar ao seu CRM e acelerar decisões."
        actions={
          <Button className="gap-2" onClick={handleNewSale}>
            <Plus className="h-4 w-4" />
            Nova oportunidade
          </Button>
        }
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle>Pipeline</CardTitle>
          <CardDescription>Mapa do funil pronto para dados dinâmicos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {pipeline.map(({ status_venda, quantidade, tempo_medio_dias }) => (
            <div key={status_venda} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{formatStatus(status_venda)}</p>
              <p className="text-3xl font-semibold text-white">{quantidade}</p>
              <p className="text-xs text-slate-400">Tempo médio {tempo_medio_dias} dias</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader>
          <CardTitle>Negócios em andamento</CardTitle>
          <CardDescription>Substitua pelos registros do seu CRM.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sales.map(({ id, cliente_nome, veiculo_modelo, preco_venda, status_venda }) => (
              <div
                key={id}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4 md:flex-row md:items-center md:justify-between"
                onMouseEnter={() => setSelectedSale(id)}
                onMouseLeave={() => setSelectedSale((value) => (value === id ? null : value))}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{cliente_nome}</p>
                  <p className="text-xs text-slate-400">{veiculo_modelo}</p>
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-500 sm:text-sm">
                  <span>{formatCurrency(preco_venda)}</span>
                  <span className="text-sky-200">{formatStatus(status_venda)}</span>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 text-xs md:text-sm"
                  onClick={() => handleAdvanceStage(id, "contrato")}
                >
                  Avançar etapa
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {selectedSale === id && (
                  <p className="text-xs text-slate-400 md:w-1/3">
                    Ao integrar, apresente checagens de crédito, tarefas pendentes ou etapas automáticas deste negócio.
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-slate-900/80">
        <CardHeader className="gap-2">
          <CardTitle>Prazos e SLAs</CardTitle>
          <CardDescription>Gestão visual pronta para receber automações e alertas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm">
            <span className="mb-2 inline-flex items-center gap-2 text-emerald-200">
              <CheckCircle className="h-4 w-4" />
              SLA cumprido
            </span>
            <p>90% das propostas fecham em até 48h após envio do contrato.</p>
          </div>
          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm">
            <span className="mb-2 inline-flex items-center gap-2 text-amber-200">
              <Clock className="h-4 w-4" />
              Atenção
            </span>
            <p>Reveja tratativas com mais de 7 dias na etapa de negociação.</p>
          </div>
          <div className="rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4 text-sm">
            <span className="mb-2 inline-flex items-center gap-2 text-sky-200">
              <Plus className="h-4 w-4" />
              Próximos passos
            </span>
            <p>Planeje automações: envio de contrato digital e integração com faturamento.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
