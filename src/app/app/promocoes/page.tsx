"use client";

import { useState } from "react";
import { Calendar, Flame, Gift, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const campaigns = [
  {
    nome: "Feirão SUV",
    periodo: "01-10 Fev",
    beneficio: "Bônus de R$ 3.000",
    status: "Ativa"
  },
  {
    nome: "Taxa zero sedan",
    periodo: "05-20 Fev",
    beneficio: "0% em 24x",
    status: "Configurando"
  }
];

export default function PromotionsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const handleCreatePromotion = () => {
    // action: iniciar criação de campanha (ex: abrindo formulário multi-etapas)
    console.info("Criar promoção");
  };

  const handleToggleCampaign = (campaign: string) => {
    // action: ligar/desligar campanha no backend ou na automação de anúncios
    console.info("Alternar campanha", campaign);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campanhas e promoções"
        description="Organize incentivos financeiros, períodos e integrações com marketing."
        actions={
          <Button className="gap-2" onClick={handleCreatePromotion}>
            <Plus className="h-4 w-4" />
            Nova campanha
          </Button>
        }
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-2">
          <CardTitle>Campanhas ativas</CardTitle>
          <CardDescription>Seções comentadas para ligar com o motor de promoções.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {campaigns.map(({ nome, periodo, beneficio, status }) => (
            <div
              key={nome}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4"
              onMouseEnter={() => setSelectedCampaign(nome)}
              onMouseLeave={() => setSelectedCampaign((value) => (value === nome ? null : value))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{nome}</p>
                  <p className="text-xs text-slate-400">Período {periodo}</p>
                </div>
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-200">{status}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Gift className="h-4 w-4 text-sky-200" />
                {beneficio}
              </div>
              <Button
                variant="outline"
                className="gap-2 text-xs"
                onClick={() => handleToggleCampaign(nome)}
              >
                Alternar status
                <Flame className="h-4 w-4" />
              </Button>
              {selectedCampaign === nome && (
                <p className="text-xs text-slate-400">
                  Ao conectar com o backend, exiba aqui KPIs de conversão, verba consumida e próximos passos.
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-slate-900/80">
        <CardHeader className="gap-3">
          <CardTitle>Agenda de ativações</CardTitle>
          <CardDescription>Exemplo de timeline para acoplar agenda de marketing.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Calendar className="h-4 w-4 text-sky-200" />
            Defina ativações futuras e automatize lembretes para a equipe.
          </div>
          <Button
            variant="ghost"
            className="gap-2 text-sm"
            onClick={() => {
              // action: abrir agenda compartilhada / integração com calendário
              console.info("Agendar campanha");
            }}
          >
            Agendar nova janela
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
