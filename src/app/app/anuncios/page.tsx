"use client";

import { useEffect, useState } from "react";
import { Megaphone, UploadCloud } from "lucide-react";

import type { MarketplaceSummary } from "../../../../backend/fixtures";
import { listPlatformStatus, updatePlatform } from "../../../../backend/modules/anuncios";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const statusLabels: Record<string, string> = {
  sincronizado: "Sincronizado",
  pendente: "Pendente",
  erro: "Erro"
};

export default function AnnouncementsPage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<MarketplaceSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadChannels = async () => {
      const data = await listPlatformStatus.mock({});
      if (!cancelled) {
        setChannels(data);
      }
    };

    void loadChannels();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdatePlatform = async (plataformaId: string) => {
    const response = await updatePlatform.mock({
      plataforma_id: plataformaId,
      empresa_id: "company-1",
      dados: { ultima_sincronizacao: new Date().toISOString() }
    });
    console.info("Atualizar plataforma", response);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão de anúncios"
        description="Conecte marketplaces, acompanhe status e orquestre reprocessamentos com segurança."
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Portais conectados</CardTitle>
          <CardDescription>
            Comentários marcam os pontos de conexão com seus serviços de anúncios.
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
                  <p className="text-xs text-slate-500">Última atualização {new Date(ultima_sincronizacao).toLocaleString("pt-BR")}</p>
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
              <div className="text-xs text-slate-400">Anúncios publicados: {anuncios_publicados}</div>
              {selectedChannel === plataforma_id && (
                <p className="text-xs text-slate-400">
                  Ao conectar com o backend, exiba aqui logs, fila de erros ou métricas do canal.
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
            Exemplo de chamada pronta para receber upload de planilhas ou integração com DMS.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">
            Faça upload manual ou conecte automações que alimentam o estoque com atualizações frequentes.
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
