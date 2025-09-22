"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Clock, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const funnel = [
  { etapa: "Novas oportunidades", quantidade: 8, tempoMedio: "3 dias" },
  { etapa: "Negociação", quantidade: 5, tempoMedio: "5 dias" },
  { etapa: "Contrato", quantidade: 2, tempoMedio: "2 dias" }
];

const deals = [
  { cliente: "Maria Oliveira", veiculo: "Compass Longitude", valor: "R$ 146.900", status: "Proposta enviada" },
  { cliente: "João Costa", veiculo: "Civic Touring", valor: "R$ 158.500", status: "Assinatura pendente" },
  { cliente: "Ana Souza", veiculo: "Tracker Premier", valor: "R$ 134.800", status: "Em negociação" }
];

export default function SalesPage() {
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);

  const handleNewDeal = () => {
    // action: conectar ao fluxo de criação de proposta (ex: abrir modal ou redirecionar para formulário)
    console.info("Nova oportunidade");
  };

  const handleAdvanceStage = (cliente: string) => {
    // action: atualizar status no CRM / backend
    console.info("Avançar etapa para", cliente);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão de vendas"
        description="Pipeline organizado para conectar ao seu CRM e acelerar decisões."
        actions={
          <Button className="gap-2" onClick={handleNewDeal}>
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
          {funnel.map(({ etapa, quantidade, tempoMedio }) => (
            <div key={etapa} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{etapa}</p>
              <p className="text-3xl font-semibold text-white">{quantidade}</p>
              <p className="text-xs text-slate-400">Tempo médio {tempoMedio}</p>
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
            {deals.map(({ cliente, veiculo, valor, status }) => (
              <div
                key={cliente}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4 md:flex-row md:items-center md:justify-between"
                onMouseEnter={() => setSelectedDeal(cliente)}
                onMouseLeave={() => setSelectedDeal((value) => (value === cliente ? null : value))}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{cliente}</p>
                  <p className="text-xs text-slate-400">{veiculo}</p>
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-500 sm:text-sm">
                  <span>{valor}</span>
                  <span className="text-sky-200">{status}</span>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 text-xs md:text-sm"
                  onClick={() => handleAdvanceStage(cliente)}
                >
                  Avançar etapa
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {selectedDeal === cliente && (
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
