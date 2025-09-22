"use client";

import { useState } from "react";
import { Megaphone, RefreshCcw, UploadCloud } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const channels = [
  { nome: "Webmotors", status: "Sincronizado", ultimaAtualizacao: "2024-02-04 10:10" },
  { nome: "OLX Motors", status: "Pendente", ultimaAtualizacao: "2024-02-03 18:45" },
  { nome: "iCarros", status: "Erro", ultimaAtualizacao: "2024-02-02 22:13" }
];

export default function AnnouncementsPage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const handleSyncAll = () => {
    // action: integrar serviço de sincronização em lote com marketplaces
    console.info("Sincronização geral iniciada");
  };

  const handlePushChannel = (channel: string) => {
    // action: disparar reprocessamento específico no conector do canal
    console.info("Atualizar canal", channel);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão de anúncios"
        description="Conecte marketplaces, acompanhe status e orquestre reprocessamentos com segurança."
        actions={
          <Button className="gap-2" onClick={handleSyncAll}>
            <RefreshCcw className="h-4 w-4" />
            Sincronizar tudo
          </Button>
        }
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Portais conectados</CardTitle>
          <CardDescription>
            Comentários marcam os pontos de conexão com seus serviços de anúncios.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {channels.map(({ nome, status, ultimaAtualizacao }) => (
            <div
              key={nome}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4"
              onMouseEnter={() => setSelectedChannel(nome)}
              onMouseLeave={() => setSelectedChannel((value) => (value === nome ? null : value))}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
                  <Megaphone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{nome}</p>
                  <p className="text-xs text-slate-500">Última atualização {ultimaAtualizacao}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-slate-400">{status}</span>
                <Button
                  variant="ghost"
                  className="gap-1 px-3 text-xs"
                  onClick={() => handlePushChannel(nome)}
                >
                  Reprocessar
                </Button>
              </div>
              {selectedChannel === nome && (
                <p className="text-xs text-slate-400">
                  Uma vez conectado ao backend, exiba aqui logs, fila de erros ou métricas do canal.
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
            // action: anexar widget de upload / integração com storage
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
