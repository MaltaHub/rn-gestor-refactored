"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, UploadCloud } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { anunciosService } from "@/lib/services/domains";
import type { AnuncioAgrupado } from "@/types/domain";
import { useGlobalLojaId } from "@/hooks/use-loja";

interface FiltrosAnuncios {
  plataformaId?: string;
  status?: string;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const lojaAtualId = useGlobalLojaId();
  const [agrupamentos, setAgrupamentos] = useState<AnuncioAgrupado[]>([]);
  const [filtros, setFiltros] = useState<FiltrosAnuncios>({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { plataformaId, status } = filtros;

  const carregarAnuncios = useCallback(async () => {
    if (!lojaAtualId) return;
    setIsLoading(true);
    try {
      const resultado = await anunciosService.listarPorPlataforma(
        { plataformaId, status },
        lojaAtualId
      );
      setAgrupamentos(resultado);
    } catch (error) {
      console.error("Falha ao listar anúncios", error);
      setFeedback("Não foi possível carregar os anúncios.");
    } finally {
      setIsLoading(false);
    }
  }, [lojaAtualId, plataformaId, status]);

  useEffect(() => {
    if (!lojaAtualId) return;
    void carregarAnuncios();
  }, [lojaAtualId, carregarAnuncios]);

  const handleFiltroSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void carregarAnuncios();
  };

  const handlePublicar = async (veiculoId: string, plataformaId: string) => {
    if (!lojaAtualId) return;
    try {
      await anunciosService.publicarAnuncio(veiculoId, plataformaId, lojaAtualId);
      setFeedback("Anúncio enviado para publicação.");
      await carregarAnuncios();
    } catch (error) {
      console.error("Erro ao publicar anúncio", error);
      setFeedback("Não foi possível publicar o anúncio.");
    }
  };

  const handleAtualizar = async (veiculoId: string, plataformaId: string) => {
    if (!lojaAtualId) return;
    try {
      await anunciosService.atualizarAnuncio(veiculoId, plataformaId, lojaAtualId, { titulo: "Atualização rápida" });
      setFeedback("Anúncio atualizado com sucesso.");
      await carregarAnuncios();
    } catch (error) {
      console.error("Erro ao atualizar anúncio", error);
      setFeedback("Não foi possível atualizar o anúncio.");
    }
  };

  const handleRemover = async (veiculoId: string, plataformaId: string) => {
    if (!lojaAtualId) return;
    try {
      await anunciosService.removerAnuncio(veiculoId, plataformaId, lojaAtualId);
      setFeedback("Anúncio removido da plataforma.");
      await carregarAnuncios();
    } catch (error) {
      console.error("Erro ao remover anúncio", error);
      setFeedback("Não foi possível remover o anúncio.");
    }
  };

  const handleSyncLote = async () => {
    if (!lojaAtualId) return;
    try {
      const resposta = await anunciosService.sincronizarAnunciosEmLote(`arquivo-${Date.now()}`, lojaAtualId);
      setFeedback(`Sincronização disparada. Protocolo ${resposta.protocolo}.`);
    } catch (error) {
      console.error("Erro ao sincronizar anúncios", error);
      setFeedback("Não foi possível iniciar a sincronização.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão de anúncios"
        description="Conecte marketplaces, acompanhe status e orquestre reprocessamentos com segurança."
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione plataforma e status para refinar a consulta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={handleFiltroSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="plataforma">
                Plataforma
              </label>
              <Input
                id="plataforma"
                value={filtros.plataformaId ?? ""}
                onChange={(event) => setFiltros((prev) => ({ ...prev, plataformaId: event.target.value }))}
                placeholder="Ex.: plat-webmotors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="status">
                Status
              </label>
              <Input
                id="status"
                value={filtros.status ?? ""}
                onChange={(event) => setFiltros((prev) => ({ ...prev, status: event.target.value }))}
                placeholder="Ex.: publicado"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isLoading}>
                Filtrar
              </Button>
            </div>
          </form>
          {feedback ? <p className="mt-4 text-xs text-slate-400">{feedback}</p> : null}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Portais conectados</CardTitle>
          <CardDescription>Integrações com marketplaces carregadas a partir do serviço de anúncios.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <p className="text-sm text-slate-400">Carregando anúncios...</p>
          ) : agrupamentos.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum anúncio encontrado para os filtros selecionados.</p>
          ) : (
            agrupamentos.map(({ plataformaId, plataformaNome, lojaId, veiculos }) => (
              <div
                key={`${plataformaId}-${lojaId}`}
                className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
                    <Megaphone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{plataformaNome}</p>
                    <p className="text-xs text-slate-500">Loja {lojaId}</p>
                  </div>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  {veiculos.map(({ veiculoId, titulo, status, atualizadoEm }) => (
                    <li key={veiculoId} className="space-y-2 rounded-2xl bg-slate-950/40 p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-100">{titulo}</p>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{status}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Atualizado em {atualizadoEm ? new Date(atualizadoEm).toLocaleString("pt-BR") : "-"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => router.push(`/app/anuncios/${veiculoId}/${plataformaId}`)}
                        >
                          Detalhar
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => handlePublicar(veiculoId, plataformaId)}>
                          Publicar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleAtualizar(veiculoId, plataformaId)}
                        >
                          Atualizar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-rose-200 hover:text-rose-100"
                          onClick={() => handleRemover(veiculoId, plataformaId)}
                        >
                          Remover
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-slate-900/80">
        <CardHeader className="gap-3">
          <CardTitle>Upload massivo</CardTitle>
          <CardDescription>Chamada pronta para receber planilhas ou integrações de DMS.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">
            Faça upload manual ou conecte automações que alimentam o estoque com atualizações frequentes.
          </p>
          <Button className="gap-2" onClick={handleSyncLote}>
            <UploadCloud className="h-4 w-4" />
            Enviar arquivo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
