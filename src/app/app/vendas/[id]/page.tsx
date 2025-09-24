"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGlobalLojaId } from "@/hooks/use-loja";
import { vendasService } from "@/lib/services/domains";
import type { VendaDetalhe } from "@/types/domain";

interface FormState {
  precoVenda: string;
  status: string;
  valorEntrada: string;
  valorFinanciado: string;
  observacoes: string;
}

export default function DetalheVendaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const globalLojaId = useGlobalLojaId();
  const vendaId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [detalhe, setDetalhe] = useState<VendaDetalhe | null>(null);
  const [formState, setFormState] = useState<FormState>({ precoVenda: "", status: "", valorEntrada: "", valorFinanciado: "", observacoes: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!vendaId) return;
    void carregarDetalhe(vendaId);
  }, [vendaId]);

  const carregarDetalhe = async (id: string) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const dados = await vendasService.obterDetalhesDaVenda(id);
      if (!dados) {
        setFeedback("Venda não encontrada.");
        return;
      }
      setDetalhe(dados);
      setFormState({
        precoVenda: dados.precoVenda != null ? String(dados.precoVenda) : "",
        status: dados.status ?? "",
        valorEntrada: dados.valorEntrada != null ? String(dados.valorEntrada) : "",
        valorFinanciado: dados.valorFinanciado != null ? String(dados.valorFinanciado) : "",
        observacoes: dados.observacoes ?? ""
      });
    } catch (error) {
      console.error("Falha ao carregar detalhes da venda", error);
      setFeedback("Não foi possível carregar a venda selecionada.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const lojaParaOperacao = detalhe?.lojaId ?? globalLojaId;

  const handleSalvar = async () => {
    if (!vendaId || !lojaParaOperacao) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await vendasService.atualizarVenda(vendaId, {
        precoVenda: formState.precoVenda ? Number(formState.precoVenda) : undefined,
        status: formState.status || undefined,
        valorEntrada: formState.valorEntrada ? Number(formState.valorEntrada) : undefined,
        valorFinanciado: formState.valorFinanciado ? Number(formState.valorFinanciado) : undefined,
        observacoes: formState.observacoes || undefined
      }, lojaParaOperacao);
      setFeedback("Venda atualizada com sucesso.");
      await carregarDetalhe(vendaId);
    } catch (error) {
      console.error("Erro ao atualizar venda", error);
      setFeedback("Não foi possível atualizar a venda.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!vendaId) {
    return <p className="text-sm text-slate-400">Identificador da venda não informado.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={detalhe ? `Venda ${detalhe.id}` : "Detalhe da venda"}
        description="Atualize informações da negociação e mantenha o CRM alinhado."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" className="gap-2" onClick={() => router.push("/app/vendas")}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button className="gap-2" onClick={handleSalvar} disabled={isSaving || isLoading || !lojaParaOperacao}>
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar venda"}
            </Button>
          </div>
        }
      />

      {feedback ? <p className="text-xs text-slate-400">{feedback}</p> : null}

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-3">
          <CardTitle>Dados financeiros</CardTitle>
          <CardDescription>Campos conectados ao `vendas.atualizar`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-slate-400">Carregando venda...</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">Preço de venda</span>
                  <Input value={formState.precoVenda} onChange={handleChange("precoVenda")} />
                </label>
                <label className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">Status</span>
                  <Input value={formState.status} onChange={handleChange("status")} />
                </label>
                <label className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">Valor de entrada</span>
                  <Input value={formState.valorEntrada} onChange={handleChange("valorEntrada")} />
                </label>
                <label className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-200">Valor financiado</span>
                  <Input value={formState.valorFinanciado} onChange={handleChange("valorFinanciado")} />
                </label>
              </div>
              <label className="text-sm text-slate-300">
                <span className="font-semibold text-slate-200">Observações</span>
                <textarea
                  value={formState.observacoes}
                  onChange={handleChange("observacoes")}
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
              </label>
            </>
          )}
        </CardContent>
      </Card>

      {detalhe ? (
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <CardTitle>Resumo da negociação</CardTitle>
            <CardDescription>Dados carregados diretamente de `vendas.detalhes`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p><span className="text-slate-500">Cliente:</span> {detalhe.clienteNome}</p>
            <p><span className="text-slate-500">Contato:</span> {detalhe.clienteContato?.documento ?? "-"}</p>
            <p><span className="text-slate-500">Veículo:</span> {detalhe.veiculoId}</p>
            <p><span className="text-slate-500">Atualizado em:</span> {detalhe.atualizadoEm ? new Date(detalhe.atualizadoEm).toLocaleString("pt-BR") : "-"}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
