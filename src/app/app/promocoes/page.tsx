"use client";

import { useState } from "react";
import { Calendar, Flame, Gift, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PromotionRecord {
  id: string;
  tipo_promocao: string;
  preco_promocional: number;
  data_inicio: string | null;
  data_fim: string | null;
  ativo: boolean;
}

const promotionTypeLabel: Record<string, string> = {
  bonus: "Bonus em dinheiro",
  "taxa-zero": "Taxa zero",
  desconto: "Desconto",
  pacote: "Pacote especial"
};

const initialPromotions: PromotionRecord[] = [
  {
    id: "promo-01",
    tipo_promocao: "bonus",
    preco_promocional: 3000,
    data_inicio: new Date().toISOString(),
    data_fim: null,
    ativo: true
  },
  {
    id: "promo-02",
    tipo_promocao: "taxa-zero",
    preco_promocional: 0,
    data_inicio: new Date().toISOString(),
    data_fim: null,
    ativo: false
  }
];

export default function PromotionsPage() {
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<PromotionRecord[]>(initialPromotions);

  const handleCreatePromotion = () => {
    const newPromotion: PromotionRecord = {
      id: `promo-${Math.random().toString(36).slice(2, 8)}`,
      tipo_promocao: "bonus",
      preco_promocional: 2500,
      data_inicio: new Date().toISOString(),
      data_fim: null,
      ativo: true
    };
    setPromotions((current) => [newPromotion, ...current]);
    console.info("Criar promocao", newPromotion);
  };

  const handleTogglePromotion = (promotionId: string) => {
    setPromotions((current) =>
      current.map((promotion) =>
        promotion.id === promotionId ? { ...promotion, ativo: !promotion.ativo } : promotion
      )
    );
    console.info("Alternar promocao", promotionId);
  };

  const handleSchedule = (promotionId: string | undefined) => {
    console.info("Agendar promocao", promotionId ?? "sem id");
  };

  const formatType = (tipo: string) => promotionTypeLabel[tipo] ?? tipo;

  const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString("pt-BR") : "Sem data");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campanhas e promocoes"
        description="Organize incentivos financeiros, periodos e integracoes com marketing."
        actions={
          <Button className="gap-2" onClick={handleCreatePromotion}>
            <Plus className="h-4 w-4" />
            Nova campanha
          </Button>
        }
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-2">
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>Sessoes prontas para ligar com o motor de promocoes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {promotions.map(({ id, tipo_promocao, preco_promocional, data_inicio, data_fim, ativo }) => (
            <div
              key={id}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4"
              onMouseEnter={() => setSelectedPromotion(id)}
              onMouseLeave={() => setSelectedPromotion((value) => (value === id ? null : value))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{formatType(tipo_promocao)}</p>
                  <p className="text-xs text-slate-400">
                    Inicio {formatDate(data_inicio)}
                    {data_fim ? ` • Fim ${formatDate(data_fim)}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-200">
                  {ativo ? "Ativa" : "Pausada"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Gift className="h-4 w-4 text-sky-200" />
                {preco_promocional.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <Button variant="outline" className="gap-2 text-xs" onClick={() => handleTogglePromotion(id)}>
                Alternar status
                <Flame className="h-4 w-4" />
              </Button>
              {selectedPromotion === id && (
                <p className="text-xs text-slate-400">
                  Ao conectar com o backend, exiba aqui KPIs de conversao, verba consumida e proximos passos.
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-slate-900/80">
        <CardHeader className="gap-3">
          <CardTitle>Agenda de ativacoes</CardTitle>
          <CardDescription>Exemplo de timeline para acoplar agenda de marketing.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Calendar className="h-4 w-4 text-sky-200" />
            Defina ativacoes futuras e automatize lembretes para a equipe.
          </div>
          <Button variant="ghost" className="gap-2 text-sm" onClick={() => handleSchedule(promotions[0]?.id)}>
            Agendar nova janela
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
