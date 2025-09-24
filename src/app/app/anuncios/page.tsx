"use client";

import { useState } from "react";
import { Megaphone, UploadCloud } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MarketplaceSummary {
  plataforma_id: string;
  plataforma_nome: string;
  status_operacao: string;
  anuncios_publicados: number;
  ultima_sincronizacao: string;
}

const statusLabels: Record<string, string> = {
  sincronizado: "Sincronizado",
  pendente: "Pendente",
  erro: "Erro"
};

const initialChannels: MarketplaceSummary[] = [
  {
    plataforma_id: "plat-01",
    plataforma_nome: "Webmotors",
    status_operacao: "sincronizado",
    anuncios_publicados: 34,
    ultima_sincronizacao: new Date().toISOString()
  },
  {
    plataforma_id: "plat-02",
    plataforma_nome: "OLX Autos",
    status_operacao: "pendente",
    anuncios_publicados: 12,
    ultima_sincronizacao: new Date().toISOString()
  },
  {
    plataforma_id: "plat-03",
    plataforma_nome: "iCarros",
    status_operacao: "erro",
    anuncios_publicados: 5,
    ultima_sincronizacao: new Date().toISOString()
  }
];

export default function AnnouncementsPage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<MarketplaceSummary[]>(initialChannels);

  const handleUpdatePlatform = (plataformaId: string) => {
    setChannels((current) =>
      current.map((channel) =>
        channel.plataforma_id === plataformaId
          ? { ...channel, status_operacao: "sincronizado", ultima_sincronizacao: new Date().toISOString() }
          : channel
      )
    );
    console.info("Atualizar plataforma", plataformaId);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestao de anuncios"
        description="Conecte marketplaces, acompanhe status e orquestre reprocessamentos com seguranca."
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Portais conectados</CardTitle>
          <CardDescription>
            Comentarios marcam os pontos de conexao com seus servicos de anuncios.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {channels.map(({ plataforma_id, plataforma_nome, status_operacao, ultima_sincronizacao, anuncios_publicados }) => (
            <div
              key={plataforma_id}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4"
              onMouseEnter={() => setSelectedChannel(plataforma_id)}
              onMouseLeave={() => setSelectedChannel((value) => (value === plataforma_id ? null : value))}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
                  <Megaphone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{plataforma_nome}</p>
                  <p className="text-xs text-slate-500">Ultima atualizacao {new Date(ultima_sincronizacao).toLocaleString("pt-BR")}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {statusLabels[status_operacao] ?? status_operacao}
                </span>
                <Button variant="ghost" className="gap-1 px-3 text-xs" onClick={() => handleUpdatePlatform(plataforma_id)}>
                  Atualizar plataforma
                </Button>
              </div>
              <div className="text-xs text-slate-400">Anuncios publicados: {anuncios_publicados}</div>
              {selectedChannel === plataforma_id && (
                <p className="text-xs text-slate-400">
                  Ao conectar com o backend, exiba aqui logs, fila de erros ou metricas do canal.
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-slate-900/80">
        <CardHeader className="gap-3">
          <CardTitle>Upload massivo</CardTitle>
          <CardDescription>
            Exemplo de chamada pronta para receber upload de planilhas ou integracao com DMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">
            Faca upload manual ou conecte automacoes que alimentam o estoque com atualizacoes frequentes.
          </p>
          <Button className="gap-2" onClick={() => {
            console.info("Upload acionado");
          }}>
            <UploadCloud className="h-4 w-4" />
            Enviar arquivo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
