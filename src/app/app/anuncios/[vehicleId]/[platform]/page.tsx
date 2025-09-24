"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, UploadCloud } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGlobalLojaId } from "@/hooks/use-loja";
import { anunciosService } from "@/lib/services/domains";
import type { AnuncioDetalhe } from "@/types/domain";

interface FormState {
  titulo: string;
  descricao: string;
  preco: string;
  status: string;
}

export default function DetalheAnuncioPage() {
  const router = useRouter();
  const params = useParams<{ vehicleId: string; platform: string }>();
  const globalLojaId = useGlobalLojaId();
  const vehicleId = Array.isArray(params?.vehicleId) ? params?.vehicleId[0] : params?.vehicleId;
  const platformId = Array.isArray(params?.platform) ? params?.platform[0] : params?.platform;

  const [detalhe, setDetalhe] = useState<AnuncioDetalhe | null>(null);
  const [formState, setFormState] = useState<FormState>({ titulo: "", descricao: "", preco: "", status: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const carregarDetalhe = useCallback(async (veiculo: string, plataforma: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const dados = await anunciosService.obterDetalhesAnuncio(veiculo, plataforma, globalLojaId ?? undefined);
      if (!dados) {
        setFeedback("Anúncio não encontrado para os parâmetros informados.");
        return;
      }
      setDetalhe(dados);
      setFormState({
        titulo: dados.titulo ?? "",
        descricao: dados.descricao ?? "",
        preco: dados.preco != null ? String(dados.preco) : "",
        status: dados.status ?? ""
      });
    } catch (error) {
      console.error("Falha ao carregar detalhes do anúncio", error);
      setFeedback("Não foi possível carregar o anúncio selecionado.");
    } finally {
      setIsLoading(false);
    }
  }, [globalLojaId]);

  useEffect(() => {
    if (!vehicleId || !platformId) return;
    void carregarDetalhe(vehicleId, platformId);
  }, [vehicleId, platformId, carregarDetalhe]);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const lojaParaOperacao = detalhe?.lojaId ?? globalLojaId;

  const handleSalvar = async () => {
    if (!vehicleId || !platformId || !lojaParaOperacao) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await anunciosService.atualizarAnuncio(vehicleId, platformId, lojaParaOperacao, {
        titulo: formState.titulo,
        descricao: formState.descricao,
        preco: formState.preco ? Number(formState.preco) : undefined,
        status: formState.status || undefined
      });
      setFeedback("Anúncio atualizado com sucesso.");
      await carregarDetalhe(vehicleId, platformId);
    } catch (error) {
      console.error("Erro ao atualizar anúncio", error);
      setFeedback("Não foi possível atualizar o anúncio.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemover = async () => {
    if (!vehicleId || !platformId || !lojaParaOperacao) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await anunciosService.removerAnuncio(vehicleId, platformId, lojaParaOperacao);
      setFeedback("Anúncio removido da plataforma.");
      router.push("/app/anuncios");
    } catch (error) {
      console.error("Erro ao remover anúncio", error);
      setFeedback("Não foi possível remover o anúncio.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRepublicar = async () => {
    if (!vehicleId || !platformId || !lojaParaOperacao) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await anunciosService.publicarAnuncio(vehicleId, platformId, lojaParaOperacao);
      setFeedback("Anúncio enviado para publicação.");
    } catch (error) {
      console.error("Erro ao republicar anúncio", error);
      setFeedback("Não foi possível republicar o anúncio.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!vehicleId || !platformId) {
    return <p className="text-sm text-slate-400">Parâmetros insuficientes para carregar o anúncio.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={detalhe ? `Anúncio em ${detalhe.plataformaId}` : "Detalhe do anúncio"}
        description="Fluxo conectado ao serviço de anúncios para edição e republicação."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" className="gap-2" onClick={() => router.push("/app/anuncios")}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button className="gap-2" onClick={handleSalvar} disabled={isSaving || isLoading || !lojaParaOperacao}>
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar anúncio"}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleRepublicar} disabled={!lojaParaOperacao || isSaving}>
              <UploadCloud className="h-4 w-4" />
              Republicar
            </Button>
            <Button variant="ghost" className="gap-2 text-red-300 hover:bg-red-500/10" onClick={handleRemover} disabled={isSaving || !lojaParaOperacao}>
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          </div>
        }
      />

      {feedback ? <p className="text-xs text-slate-400">{feedback}</p> : null}

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Informações do anúncio</CardTitle>
          <CardDescription>Campos enviados ao `anuncios.atualizar`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-slate-400">Carregando anúncio...</p>
          ) : (
            <>
              <label className="text-sm text-slate-300">
                <span className="font-semibold text-slate-200">Título</span>
                <Input value={formState.titulo} onChange={handleChange("titulo")} />
              </label>
              <label className="text-sm text-slate-300">
                <span className="font-semibold text-slate-200">Descrição</span>
                <textarea
                  value={formState.descricao}
                  onChange={handleChange("descricao")}
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">Preço</span>
                  <Input value={formState.preco} onChange={handleChange("preco")} />
                </label>
                <label className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">Status</span>
                  <Input value={formState.status} onChange={handleChange("status")} />
                </label>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {detalhe ? (
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <CardTitle>Metadados</CardTitle>
            <CardDescription>Dados fornecidos pelo serviço `anuncios.detalhes`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p><span className="text-slate-500">Identificador:</span> {detalhe.identificador ?? "-"}</p>
            <p><span className="text-slate-500">Publicado em:</span> {detalhe.publicadoEm ? new Date(detalhe.publicadoEm).toLocaleString("pt-BR") : "-"}</p>
            <p><span className="text-slate-500">Atualizado em:</span> {detalhe.atualizadoEm ? new Date(detalhe.atualizadoEm).toLocaleString("pt-BR") : "-"}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
