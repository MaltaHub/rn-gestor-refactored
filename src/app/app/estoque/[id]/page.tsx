"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Save, Trash2 } from "lucide-react";
import Image from "next/image";

import { LojaSwitch } from "@/components/navigation/loja-switch";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGlobalLojaId } from "@/hooks/use-loja";
import { estoqueService } from "@/lib/services/domains";
import type { VehicleDetail } from "@/types/domain";

interface LojaMidiaOption {
  id: string;
  nome?: string;
}

interface FormState {
  precoVenal: string;
  observacao: string;
  estadoVeiculo: string;
  estadoVenda: string;
}

export default function DetalheEstoquePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const globalLojaId = useGlobalLojaId();
  const veiculoId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [detalhe, setDetalhe] = useState<VehicleDetail | null>(null);
  const [formState, setFormState] = useState<FormState>({ precoVenal: "", observacao: "", estadoVeiculo: "", estadoVenda: "" });
  const [midiaPorLoja, setMidiaPorLoja] = useState<Record<string, string[]>>({});
  const [lojaMidiaId, setLojaMidiaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const carregarDetalhe = useCallback(async (id: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const dados = await estoqueService.obterDetalhesDoVeiculo(id, globalLojaId ?? undefined);
      if (!dados) {
        setFeedback("Veículo não encontrado.");
        return;
      }
      setDetalhe(dados);
      setFormState({
        precoVenal: dados.precoVenal != null ? String(dados.precoVenal) : "",
        observacao: dados.observacao ?? "",
        estadoVeiculo: dados.estadoVeiculo ?? "",
        estadoVenda: dados.estadoVenda ?? ""
      });
      const midiaMap: Record<string, string[]> = {};
      dados.midiaPorLoja.forEach((entrada) => {
        midiaMap[entrada.lojaId] = entrada.fotos.map((foto) => foto.path);
      });
      setMidiaPorLoja(midiaMap);
      setLojaMidiaId((current) => current ?? dados.midiaPorLoja[0]?.lojaId ?? null);
    } catch (error) {
      console.error("Falha ao carregar detalhes do veículo", error);
      setFeedback("Não foi possível carregar os detalhes do veículo.");
    } finally {
      setIsLoading(false);
    }
  }, [globalLojaId]);

  useEffect(() => {
    if (!veiculoId) return;
    void carregarDetalhe(veiculoId);
  }, [veiculoId, carregarDetalhe]);

  const lojaOptions = useMemo<LojaMidiaOption[]>(() => {
    if (!detalhe) return [];
    return detalhe.midiaPorLoja.map((entrada) => ({ id: entrada.lojaId, nome: entrada.lojaNome }));
  }, [detalhe]);

  const fotosAtuais = useMemo(() => {
    if (!lojaMidiaId) return [];
    return midiaPorLoja[lojaMidiaId] ?? [];
  }, [midiaPorLoja, lojaMidiaId]);

  const handleFormChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalvarDados = async () => {
    if (!detalhe) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await estoqueService.atualizarVeiculo(detalhe.id, {
        precoVenal: formState.precoVenal ? Number(formState.precoVenal) : undefined,
        observacao: formState.observacao || undefined,
        estadoVeiculo: formState.estadoVeiculo || undefined,
        estadoVenda: formState.estadoVenda || undefined
      });
      setFeedback("Dados do veículo atualizados.");
      await carregarDetalhe(detalhe.id);
    } catch (error) {
      console.error("Erro ao salvar dados do veículo", error);
      setFeedback("Não foi possível salvar as alterações do veículo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdicionarFoto = () => {
    if (!lojaMidiaId) return;
    const novaFoto = `/uploads/${Date.now()}.jpg`;
    setMidiaPorLoja((prev) => ({
      ...prev,
      [lojaMidiaId]: [...(prev[lojaMidiaId] ?? []), novaFoto]
    }));
  };

  const handleRemoverFoto = (index: number) => {
    if (!lojaMidiaId) return;
    setMidiaPorLoja((prev) => ({
      ...prev,
      [lojaMidiaId]: (prev[lojaMidiaId] ?? []).filter((_, fotoIndex) => fotoIndex !== index)
    }));
  };

  const handleSalvarMidia = async () => {
    if (!detalhe || !lojaMidiaId) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await estoqueService.gerenciarMidiaDoVeiculo(detalhe.id, lojaMidiaId, midiaPorLoja[lojaMidiaId] ?? []);
      setFeedback("Mídia atualizada para a loja selecionada.");
      await carregarDetalhe(detalhe.id);
    } catch (error) {
      console.error("Erro ao salvar mídia", error);
      setFeedback("Não foi possível salvar as alterações de mídia.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!veiculoId) {
    return <p className="text-sm text-slate-400">Identificador do veículo não informado.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={detalhe ? `Veículo ${detalhe.placa ?? detalhe.id}` : "Detalhe do veículo"}
        description="Informações conectadas ao serviço de estoque para edição completa."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" className="gap-2" onClick={() => router.push("/app/estoque")}>
              <ArrowLeft className="h-4 w-4" />
              Voltar ao estoque
            </Button>
            <Button className="gap-2" onClick={handleSalvarDados} disabled={isSaving || isLoading}>
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar dados"}
            </Button>
          </div>
        }
      />

      {feedback ? <p className="text-xs text-slate-400">{feedback}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <CardTitle>Dados gerais</CardTitle>
            <CardDescription>Campos conectados ao `estoque.detalhes` e `estoque.atualizar`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-slate-400">Carregando informações do veículo...</p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-300">
                    <span className="font-semibold text-slate-200">Preço venal</span>
                    <Input value={formState.precoVenal} onChange={handleFormChange("precoVenal")} />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="font-semibold text-slate-200">Estado do veículo</span>
                    <Input value={formState.estadoVeiculo} onChange={handleFormChange("estadoVeiculo")} />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="font-semibold text-slate-200">Estado da venda</span>
                    <Input value={formState.estadoVenda} onChange={handleFormChange("estadoVenda")} />
                  </label>
                </div>
                <label className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">Observação</span>
                  <textarea
                    value={formState.observacao}
                    onChange={handleFormChange("observacao")}
                    className="min-h-[96px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                  />
                </label>
              </>
            )}
          </CardContent>
        </Card>

        {detalhe ? (
          <Card className="border-white/10 bg-slate-900/70">
            <CardHeader className="gap-3">
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Informações retornadas diretamente pelo serviço de estoque.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Modelo:</span> {detalhe.modeloMarca ?? ""} {detalhe.modeloNome ?? ""}</p>
              <p><span className="text-slate-500">Placa:</span> {detalhe.placa ?? "-"}</p>
              <p><span className="text-slate-500">Quilometragem:</span> {detalhe.hodometro ?? 0} km</p>
              <p><span className="text-slate-500">Ano:</span> {detalhe.anoFabricacao ?? "-"} / {detalhe.anoModelo ?? "-"}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Mídia por loja</CardTitle>
          <CardDescription>Operações conectadas a `estoque.gerenciarMidia` com controle por loja.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lojaOptions.length > 0 ? (
            <LojaSwitch
              lojas={lojaOptions.map((option) => ({ id: option.id, nome: option.nome ?? option.id }))}
              value={lojaMidiaId}
              onChange={(lojaId) => setLojaMidiaId(lojaId)}
            />
          ) : (
            <p className="text-sm text-slate-400">Nenhuma loja configurada para mídia.</p>
          )}
          {lojaMidiaId ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={handleAdicionarFoto}>
                  <ImagePlus className="h-4 w-4" />
                  Adicionar foto
                </Button>
                <Button variant="ghost" className="gap-2" onClick={handleSalvarMidia} disabled={isSaving}>
                  <Save className="h-4 w-4" />
                  Salvar mídia
                </Button>
              </div>
              {fotosAtuais.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhuma foto cadastrada para esta loja.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  {fotosAtuais.map((foto, index) => (
                    <div key={foto} className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                      <div className="relative h-32 overflow-hidden rounded-xl bg-slate-900/50">
                        <Image
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          width={320}
                          height={180}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-red-300 hover:bg-red-500/10"
                        onClick={() => handleRemoverFoto(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
