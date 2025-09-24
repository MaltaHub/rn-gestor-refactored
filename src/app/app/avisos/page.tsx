"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CameraOff, Megaphone, RefreshCcw } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { avisosService } from "@/lib/services/domains";
import type { AvisoPendencia } from "@/types/domain";

interface AvisoMeta {
  title: string;
  description: string;
  actionLabel: string;
  icon: typeof CameraOff;
  destino: (aviso: AvisoPendencia) => string | null;
}

const avisoMetaMap: Record<AvisoPendencia["tipo"], AvisoMeta> = {
  sem_foto: {
    title: "Veículo sem fotos",
    description: "Adicione imagens para manter a vitrine e os portais atualizados.",
    actionLabel: "Adicionar fotos",
    icon: CameraOff,
    destino: (aviso) => `/app/estoque/${aviso.veiculoId}`
  },
  sem_anuncio: {
    title: "Veículo sem anúncio",
    description: "Publique o anúncio para ativar a presença nos marketplaces.",
    actionLabel: "Publicar anúncio",
    icon: Megaphone,
    destino: () => "/app/anuncios"
  },
  anuncio_desatualizado: {
    title: "Anúncio desatualizado",
    description: "Revise preço e informações antes que a plataforma reduza a entrega.",
    actionLabel: "Revisar anúncio",
    icon: RefreshCcw,
    destino: () => "/app/anuncios"
  }
};

export default function AvisosPage() {
  const router = useRouter();
  const [avisos, setAvisos] = useState<AvisoPendencia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    void carregarAvisos();
  }, []);

  const carregarAvisos = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const dados = await avisosService.listarAvisos();
      setAvisos(dados);
    } catch (error) {
      console.error("Falha ao carregar avisos", error);
      setFeedback("Não foi possível carregar os avisos operacionais.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbrirDestino = (aviso: AvisoPendencia) => {
    const meta = avisoMetaMap[aviso.tipo];
    const destino = meta?.destino(aviso);
    if (destino) {
      router.push(destino);
    }
  };

  const formatarData = (valor: string) => new Date(valor).toLocaleString("pt-BR");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Avisos operacionais"
        description="Central de pendências conectada aos principais fluxos do Gestor Automotivo."
        actions={
          <Button className="gap-2" variant="outline" onClick={carregarAvisos}>
            <RefreshCcw className="h-4 w-4" />
            Atualizar avisos
          </Button>
        }
      />

      {feedback ? <p className="text-xs text-slate-400">{feedback}</p> : null}

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-2">
          <CardTitle>Painel de pendências</CardTitle>
          <CardDescription>Dados provenientes de `avisos.pendencias`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-slate-400">Carregando avisos...</p>
          ) : avisos.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma pendência encontrada. Excelente trabalho!</p>
          ) : (
            avisos.map((aviso) => {
              const meta = avisoMetaMap[aviso.tipo];
              const Icon = meta?.icon ?? AlertTriangle;
              return (
                <div
                  key={aviso.id}
                  className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{meta?.title ?? "Aviso"}</p>
                      <p className="text-xs text-slate-500">
                        Veículo {aviso.veiculoId}
                        {aviso.lojaId ? ` • Loja ${aviso.lojaId}` : ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{aviso.descricao ?? meta?.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button size="sm" className="gap-2" onClick={() => handleAbrirDestino(aviso)}>
                      {meta?.actionLabel ?? "Ver detalhe"}
                    </Button>
                    <span className="text-xs text-slate-500">Gerado em {formatarData(aviso.criadoEm)}</span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
