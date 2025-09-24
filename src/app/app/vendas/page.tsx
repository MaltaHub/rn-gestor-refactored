"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Clock, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PipelineSnapshotItem {
  status_venda: string;
  quantidade: number;
  tempo_medio_dias: number;
}

interface SaleRecord {
  id: string;
  cliente_nome: string;
  veiculo_modelo: string;
  preco_venda: number;
  status_venda: string;
}

const initialPipeline: PipelineSnapshotItem[] = [
  { status_venda: "negociacao", quantidade: 6, tempo_medio_dias: 4 },
  { status_venda: "proposta", quantidade: 3, tempo_medio_dias: 2 },
  { status_venda: "contrato", quantidade: 2, tempo_medio_dias: 1 }
];

const initialSales: SaleRecord[] = [
  {
    id: "sale-01",
    cliente_nome: "Joao Fonseca",
    veiculo_modelo: "Compass Longitude",
    preco_venda: 189900,
    status_venda: "negociacao"
  },
  {
    id: "sale-02",
    cliente_nome: "Maria Silva",
    veiculo_modelo: "Corolla Altis",
    preco_venda: 152000,
    status_venda: "proposta"
  },
  {
    id: "sale-03",
    cliente_nome: "Andre Ramos",
    veiculo_modelo: "Pulse Audace",
    preco_venda: 112500,
    status_venda: "contrato"
  }
];

export default function SalesPage() {
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<PipelineSnapshotItem[]>(initialPipeline);
  const [sales, setSales] = useState<SaleRecord[]>(initialSales);

  const handleNewSale = () => {
    const newSale: SaleRecord = {
      id: `sale-${Math.random().toString(36).slice(2, 8)}`,
      cliente_nome: "Cliente piloto",
      veiculo_modelo: "Modelo prioritario",
      preco_venda: 0,
      status_venda: "negociacao"
    };
    setSales((current) => [newSale, ...current]);
    setPipeline((current) =>
      current.map((item) => (item.status_venda === "negociacao" ? { ...item, quantidade: item.quantidade + 1 } : item))
    );
    console.info("Nova venda", newSale);
  };

  const handleAdvanceStage = (saleId: string, nextStage: string) => {
    setSales((current) =>
      current.map((sale) => (sale.id === saleId ? { ...sale, status_venda: nextStage } : sale))
    );
    setPipeline((current) =>
      current.map((item) =>
        item.status_venda === nextStage ? { ...item, quantidade: item.quantidade + 1 } : item
      )
    );
    console.info("Avancar etapa", saleId, nextStage);
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "negociacao":
        return "Negociacao";
      case "proposta":
        return "Proposta";
      case "contrato":
        return "Contrato";
      case "concluida":
        return "Concluida";
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestao de vendas"
        description="Pipeline organizado para conectar ao seu CRM e acelerar decisoes."
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
          <CardDescription>Mapa do funil pronto para dados dinamicos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {pipeline.map(({ status_venda, quantidade, tempo_medio_dias }) => (
            <div key={status_venda} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{formatStatus(status_venda)}</p>
              <p className="text-3xl font-semibold text-white">{quantidade}</p>
              <p className="text-xs text-slate-400">Tempo medio {tempo_medio_dias} dias</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader>
          <CardTitle>Negocios em andamento</CardTitle>
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
                <Button variant="outline" className="gap-2 text-xs md:text-sm" onClick={() => handleAdvanceStage(id, "contrato")}>
                  Avancar etapa
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {selectedSale === id && (
                  <p className="text-xs text-slate-400 md:w-1/3">
                    Ao integrar, apresente checagens de credito, tarefas pendentes ou etapas automaticas deste negocio.
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
          <CardDescription>Gestao visual pronta para receber automacoes e alertas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm">
            <span className="mb-2 inline-flex items-center gap-2 text-emerald-200">
              <CheckCircle className="h-4 w-4" />
              SLA cumprido
            </span>
            <p>90% das propostas fecham em ate 48h apos envio do contrato.</p>
          </div>
          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm">
            <span className="mb-2 inline-flex items-center gap-2 text-amber-200">
              <Clock className="h-4 w-4" />
              Atenção aos prazos
            </span>
            <p>Negociacoes acima de 7 dias entram em alerta automatico.</p>
          </div>
          <div className="rounded-2xl border border-sky-400/40 bg-sky-400/10 p-4 text-sm">
            <span className="mb-2 inline-flex items-center gap-2 text-sky-200">
              <ArrowRight className="h-4 w-4" />
              Etapas futuras
            </span>
            <p>Prepare integrações com CRM para disparar tarefas e notificacoes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
