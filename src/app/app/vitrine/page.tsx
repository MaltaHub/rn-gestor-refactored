"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Plus, RefreshCcw, Store } from "lucide-react";
import Image from "next/image";

import { LojaSwitch, type LojaOption } from "@/components/navigation/loja-switch";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalLojaId } from "@/hooks/use-loja";
import { usuariosService, vitrineService } from "@/lib/services/domains";
import type {
  LojaDisponivel,
  VitrineDisponivelResumo,
  VitrineRelacionamento,
  VitrineResumo
} from "@/types/domain";

export default function VitrinePage() {
  const router = useRouter();
  const globalLojaId = useGlobalLojaId();
  const [lojas, setLojas] = useState<LojaDisponivel[]>([]);
  const [lojaAtual, setLojaAtual] = useState<string | null>(null);
  const [entradas, setEntradas] = useState<VitrineResumo[]>([]);
  const [disponiveis, setDisponiveis] = useState<VitrineDisponivelResumo[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<VitrineRelacionamento[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDisponiveis, setLoadingDisponiveis] = useState(false);
  const [alterandoLoja, setAlterandoLoja] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lojasDisponiveis = await usuariosService.listarLojasDisponiveis();
        if (!ativo) return;
        setLojas(lojasDisponiveis);
      } catch (error) {
        console.error("Falha ao carregar lojas para vitrine", error);
        setFeedback("Não foi possível carregar as lojas disponíveis.");
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    setLojaAtual(globalLojaId ?? null);
  }, [globalLojaId]);

  const lojaOptions = useMemo<LojaOption[]>(() => {
    return lojas.map((loja) => ({ id: loja.id, nome: loja.nome, cidade: loja.cidade, uf: loja.uf ?? undefined }));
  }, [lojas]);

  const carregarVitrine = useCallback(async (lojaId: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [itens, relacoes] = await Promise.all([
        vitrineService.listarVitrine({}, lojaId),
        vitrineService.listarRelacionamentos(lojaId)
      ]);
      setEntradas(itens);
      setRelacionamentos(relacoes);
    } catch (error) {
      console.error("Falha ao carregar vitrine", error);
      setFeedback("Não foi possível carregar a vitrine da loja atual.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const carregarDisponiveis = useCallback(async (lojaId: string) => {
    setLoadingDisponiveis(true);
    try {
      const itens = await vitrineService.listarDisponiveis({}, lojaId);
      setDisponiveis(itens);
    } catch (error) {
      console.error("Falha ao carregar veículos disponíveis", error);
      setFeedback("Não foi possível carregar os veículos disponíveis para a vitrine.");
    } finally {
      setLoadingDisponiveis(false);
    }
  }, []);

  useEffect(() => {
    if (!lojaAtual) return;
    void carregarVitrine(lojaAtual);
  }, [lojaAtual, carregarVitrine]);

  useEffect(() => {
    if (editMode && lojaAtual) {
      void carregarDisponiveis(lojaAtual);
    }
  }, [editMode, lojaAtual, carregarDisponiveis]);

  const handleTrocarLoja = async (lojaId: string) => {
    setAlterandoLoja(true);
    setFeedback(null);
    try {
      await usuariosService.definirLojaAtual(lojaId);
      setLojaAtual(lojaId);
      setEditMode(false);
    } catch (error) {
      console.error("Erro ao definir loja atual", error);
      setFeedback("Não foi possível atualizar a loja atual.");
    } finally {
      setAlterandoLoja(false);
    }
  };

  const handleRemoverDaVitrine = async (veiculoId: string) => {
    if (!lojaAtual) return;
    try {
      await vitrineService.removerDaVitrine(veiculoId, lojaAtual);
      setFeedback("Veículo removido da vitrine com sucesso.");
      await carregarVitrine(lojaAtual);
      if (editMode) {
        await carregarDisponiveis(lojaAtual);
      }
    } catch (error) {
      console.error("Erro ao remover veículo da vitrine", error);
      setFeedback("Não foi possível remover o veículo da vitrine.");
    }
  };

  const handleAdicionarAVitrine = async (veiculoId: string) => {
    if (!lojaAtual) return;
    try {
      await vitrineService.adicionarAVitrine(veiculoId, lojaAtual);
      setFeedback("Veículo adicionado à vitrine da loja.");
      await carregarVitrine(lojaAtual);
      await carregarDisponiveis(lojaAtual);
    } catch (error) {
      console.error("Erro ao adicionar veículo à vitrine", error);
      setFeedback("Não foi possível adicionar o veículo à vitrine.");
    }
  };

  const toggleEditMode = () => {
    setEditMode((previous) => !previous);
  };

  const handleAbrirDetalhes = (veiculoId: string) => {
    router.push(`/app/vitrine/${veiculoId}`);
  };

  const formatarMoeda = (valor?: number) => {
    if (typeof valor !== "number") return "Sem preço";
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vitrine por loja"
        description="Controle quais veículos aparecem em cada vitrine conectada ao estoque único."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {lojaOptions.length > 0 ? (
              <LojaSwitch
                lojas={lojaOptions}
                value={lojaAtual}
                onChange={handleTrocarLoja}
                isLoading={alterandoLoja}
              />
            ) : null}
            <Button variant={editMode ? "default" : "outline"} onClick={toggleEditMode} disabled={!lojaAtual}>
              {editMode ? "Finalizar edição" : "Editar vitrine"}
            </Button>
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => lojaAtual && carregarVitrine(lojaAtual)}
              disabled={!lojaAtual}
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar vitrine
            </Button>
          </div>
        }
      />

      {feedback ? <p className="text-xs text-slate-400">{feedback}</p> : null}

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Veículos em destaque</CardTitle>
          <CardDescription>
            Dados carregados via `vitrine.listar` respeitando o contexto da loja atual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-400">Carregando vitrine...</p>
          ) : entradas.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum veículo configurado para esta vitrine.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {entradas.map((entrada) => (
                <div key={`${entrada.veiculoId}-${entrada.lojaId}`} className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="overflow-hidden rounded-xl bg-slate-900/60">
                    {entrada.imageUrl ? (
                      <Image
                        src={entrada.imageUrl}
                        alt={entrada.titulo}
                        width={320}
                        height={160}
                        className="h-40 w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-xs text-slate-500">Sem imagem</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{entrada.titulo}</p>
                    <p className="text-xs text-slate-500">Status anúncio: {entrada.statusAnuncio}</p>
                    <p className="text-sm text-slate-200">{formatarMoeda(entrada.preco)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleAbrirDetalhes(entrada.veiculoId)}>
                      <Eye className="h-4 w-4" />
                      Visualizar detalhes
                    </Button>
                    {editMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleRemoverDaVitrine(entrada.veiculoId)}
                      >
                        Remover da loja
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editMode ? (
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <CardTitle>Veículos disponíveis para adicionar</CardTitle>
            <CardDescription>
              Lista gerada a partir de `vitrine.disponiveis`, considerando veículos fora da vitrine da loja atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDisponiveis ? (
              <p className="text-sm text-slate-400">Carregando veículos disponíveis...</p>
            ) : disponiveis.length === 0 ? (
              <p className="text-sm text-slate-400">Todos os veículos já estão expostos na vitrine.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {disponiveis.map((item) => (
                  <div key={item.veiculoId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.titulo}</p>
                      <p className="text-xs text-slate-500">{formatarMoeda(item.preco)}</p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleAdicionarAVitrine(item.veiculoId)}
                      disabled={item.jaNaLoja}
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-white/5 bg-slate-900/80">
        <CardHeader className="gap-3">
          <CardTitle>Relacionamentos entre lojas</CardTitle>
          <CardDescription>
            Dados provenientes de `vitrine.relacionamentos` para monitorar compartilhamentos e governança do estoque.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {relacionamentos.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum relacionamento configurado para esta loja.</p>
          ) : (
            relacionamentos.map((relacionamento) => (
              <div
                key={relacionamento.lojaId}
                className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex items-center gap-3 text-sm text-white">
                  <Store className="h-4 w-4 text-sky-200" />
                  <span>{relacionamento.lojaNome}</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-400">
                  {relacionamento.compartilhamentos.map((compartilhamento) => (
                    <li key={compartilhamento.lojaId}>
                      {compartilhamento.lojaNome} • {compartilhamento.ativo ? "Compartilhamento ativo" : "Compartilhamento pausado"}
                    </li>
                  ))}
                </ul>
                {relacionamento.observacao ? (
                  <p className="text-xs text-slate-500">{relacionamento.observacao}</p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
