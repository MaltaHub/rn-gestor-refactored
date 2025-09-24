"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Gift, RefreshCcw, Sparkles, TrendingUp } from "lucide-react";

import { LojaSwitch, type LojaOption } from "@/components/navigation/loja-switch";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalLojaId } from "@/hooks/use-loja";
import { promocoesService, usuariosService } from "@/lib/services/domains";
import type { LojaDisponivel, PromocaoResumo, PromocaoTabelaEntrada } from "@/types/domain";

export default function PromotionsPage() {
  const globalLojaId = useGlobalLojaId();
  const [lojas, setLojas] = useState<LojaDisponivel[]>([]);
  const [lojaAtual, setLojaAtual] = useState<string | null>(null);
  const [tabela, setTabela] = useState<PromocaoTabelaEntrada[]>([]);
  const [campanhas, setCampanhas] = useState<PromocaoResumo[]>([]);
  const [isCarregandoLojas, setIsCarregandoLojas] = useState(true);
  const [isCarregandoTabela, setIsCarregandoTabela] = useState(false);
  const [atualizandoLoja, setAtualizandoLoja] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lojasDisponiveis = await usuariosService.listarLojasDisponiveis();
        if (!ativo) return;
        setLojas(lojasDisponiveis);
      } catch (error) {
        console.error("Falha ao carregar lojas para promoções", error);
        setFeedback("Não foi possível carregar as lojas disponíveis.");
      } finally {
        if (ativo) {
          setIsCarregandoLojas(false);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    setLojaAtual(globalLojaId ?? null);
  }, [globalLojaId]);

  useEffect(() => {
    if (!lojaAtual) return;
    void carregarPromocoes(lojaAtual);
  }, [lojaAtual]);

  const carregarPromocoes = async (lojaId: string) => {
    setIsCarregandoTabela(true);
    setFeedback(null);
    try {
      const [tabelaPrecos, campanhasAtivas] = await Promise.all([
        promocoesService.listarTabelaDePrecos(lojaId),
        promocoesService.listarCampanhas(lojaId, { somenteAtivas: true })
      ]);
      setTabela(tabelaPrecos);
      setCampanhas(campanhasAtivas);
    } catch (error) {
      console.error("Falha ao carregar promoções", error);
      setFeedback("Não foi possível carregar os dados de promoções da loja selecionada.");
    } finally {
      setIsCarregandoTabela(false);
    }
  };

  const lojaOptions = useMemo<LojaOption[]>(() => {
    return lojas.map(({ id, nome, cidade, uf }) => ({ id, nome, cidade, uf: uf ?? undefined }));
  }, [lojas]);

  const campanhasAtivas = useMemo(() => campanhas.filter((campanha) => campanha.ativo), [campanhas]);

  const totalIncentivos = useMemo(() => {
    return campanhasAtivas.reduce((total, campanha) => total + (campanha.precoPromocional ?? 0), 0);
  }, [campanhasAtivas]);

  const formatarMoeda = (valor?: number | null) => {
    if (valor == null) return "-";
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatarData = (valor?: string | null) => {
    if (!valor) return "Sem data";
    return new Date(valor).toLocaleDateString("pt-BR");
  };

  const handleTrocarLoja = async (lojaId: string) => {
    setAtualizandoLoja(true);
    setFeedback(null);
    try {
      await usuariosService.definirLojaAtual(lojaId);
      setLojaAtual(lojaId);
      setFeedback("Loja atual ajustada para o contexto de promoções.");
    } catch (error) {
      console.error("Erro ao definir loja atual", error);
      setFeedback("Não foi possível atualizar a loja atual. Tente novamente.");
    } finally {
      setAtualizandoLoja(false);
    }
  };

  const handleAplicarAjuste = async (campanha: PromocaoResumo) => {
    if (!lojaAtual || !campanha.veiculoId) return;
    const sugestao = formatarMoeda(campanha.precoPromocional);
    const entrada = window.prompt("Informe o novo preço promocional", sugestao);
    if (!entrada) return;
    const normalizado = Number(entrada.replace(/\./g, "").replace(",", "."));
    if (Number.isNaN(normalizado)) {
      setFeedback("Valor inválido para o ajuste de preço.");
      return;
    }
    try {
      await promocoesService.aplicarAjustePromocional(lojaAtual, campanha.veiculoId, normalizado);
      setFeedback("Ajuste aplicado com sucesso.");
      await carregarPromocoes(lojaAtual);
    } catch (error) {
      console.error("Falha ao aplicar ajuste promocional", error);
      setFeedback("Não foi possível aplicar o ajuste promocional.");
    }
  };

  const handleAtualizarCampanha = async (campanha: PromocaoResumo) => {
    if (!lojaAtual) return;
    const entrada = window.prompt(
      "Defina a nova data de término (YYYY-MM-DD) ou deixe em branco para remover",
      campanha.dataFim ?? ""
    );
    if (entrada === null) return;
    const valor = entrada.trim();
    let dataFimIso: string | undefined;
    if (valor) {
      const parsed = new Date(valor);
      if (Number.isNaN(parsed.getTime())) {
        setFeedback("Data inválida. Utilize o formato YYYY-MM-DD.");
        return;
      }
      dataFimIso = parsed.toISOString();
    }
    try {
      await promocoesService.atualizarPromocao(lojaAtual, campanha.id, {
        dataFim: dataFimIso
      });
      setFeedback("Campanha atualizada com sucesso.");
      await carregarPromocoes(lojaAtual);
    } catch (error) {
      console.error("Erro ao atualizar campanha", error);
      setFeedback("Não foi possível atualizar a campanha selecionada.");
    }
  };

  const handleReverterCampanha = async (campanha: PromocaoResumo) => {
    if (!lojaAtual || !campanha.veiculoId) return;
    try {
      await promocoesService.reverterPromocao(lojaAtual, campanha.veiculoId);
      setFeedback("Campanha revertida. O preço original foi restaurado.");
      await carregarPromocoes(lojaAtual);
    } catch (error) {
      console.error("Erro ao reverter campanha", error);
      setFeedback("Não foi possível reverter a campanha.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campanhas e promoções"
        description="Planeje ajustes de preço por loja e acompanhe o impacto direto nas vitrines e anúncios."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {lojaOptions.length > 0 ? (
              <LojaSwitch
                lojas={lojaOptions}
                value={lojaAtual}
                onChange={handleTrocarLoja}
                isLoading={isCarregandoLojas || atualizandoLoja}
              />
            ) : null}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => lojaAtual && carregarPromocoes(lojaAtual)}
              disabled={!lojaAtual || isCarregandoTabela}
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar painel
            </Button>
          </div>
        }
      />

      {feedback ? <p className="text-xs text-slate-400">{feedback}</p> : null}

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Tabela de preços promocionais</CardTitle>
          <CardDescription>Dados consolidados a partir do serviço `promocoes.tabelaPrecos`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCarregandoTabela ? (
            <p className="text-sm text-slate-400">Carregando promoções da loja selecionada...</p>
          ) : tabela.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum ajuste promocional cadastrado para esta loja.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {tabela.map(({ id, anuncioId, precoPromocional, dataInicio, dataFim, tipoPromocao }) => (
                <div key={id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{tipoPromocao}</span>
                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] text-sky-200">
                      {anuncioId ? `Anúncio ${anuncioId}` : "Sem anúncio"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <Gift className="h-4 w-4 text-sky-200" />
                    {formatarMoeda(precoPromocional)}
                  </div>
                  <div className="text-xs text-slate-400">
                    Vigência {formatarData(dataInicio)} • {formatarData(dataFim)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Campanhas ativas</CardTitle>
          <CardDescription>
            Fluxos conectados a `promocoes.campanhas` para aplicar ajustes, editar vigência e reverter ações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {campanhas.length === 0 ? (
            <p className="text-sm text-slate-400">Sem campanhas cadastradas para a loja atual.</p>
          ) : (
            campanhas.map((campanha) => (
              <div
                key={campanha.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{campanha.tipoPromocao}</p>
                  <p className="text-xs text-slate-400">
                    {campanha.veiculoId ? `Veículo ${campanha.veiculoId}` : "Veículo vinculado ao anúncio"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Vigência até {formatarData(campanha.dataFim)} • Iniciada {formatarData(campanha.dataInicio)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{formatarMoeda(campanha.precoPromocional)}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-sky-200">
                    {campanha.ativo ? "Ativa" : "Pausada"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleAplicarAjuste(campanha)}
                    disabled={!lojaAtual}
                  >
                    Aplicar ajuste
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleAtualizarCampanha(campanha)}
                    disabled={!lojaAtual}
                  >
                    Atualizar vigência
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleReverterCampanha(campanha)}
                    disabled={!lojaAtual}
                  >
                    Reverter
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-slate-900/80">
        <CardHeader className="gap-3">
          <CardTitle>Métricas de incentivo</CardTitle>
          <CardDescription>Sinalizadores para orientar campanhas cross-loja.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Campanhas ativas</span>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
              <Sparkles className="h-5 w-5 text-sky-200" />
              {campanhasAtivas.length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Total incentivado</span>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
              <TrendingUp className="h-5 w-5 text-sky-200" />
              {formatarMoeda(totalIncentivos)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Próximas revisões</span>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
              <Calendar className="h-5 w-5 text-sky-200" />
              {campanhas.filter((campanha) => campanha.dataFim).length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
