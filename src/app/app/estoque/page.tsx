"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, FileUp, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { estoqueService } from "@/lib/services/domains";
import type { VehicleSummary } from "@/types/domain";

interface FiltrosEstoque {
  termo?: string;
  cor?: string;
  ano?: string;
  lojaId?: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [veiculos, setVeiculos] = useState<VehicleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosEstoque>({});
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const carregarEstoque = useCallback(async () => {
    setIsLoading(true);
    try {
      const resposta = await estoqueService.listarEstoque();
      setVeiculos(resposta.itens);
    } catch (error) {
      console.error("Falha ao listar estoque", error);
      setFeedback("Não foi possível carregar o estoque.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregarEstoque();
  }, [carregarEstoque]);

  const handleBuscar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSearching(true);
    try {
      const resposta = await estoqueService.buscarNoEstoque({
        termo: filtros.termo || undefined,
        cor: filtros.cor || undefined,
        ano: filtros.ano ? Number(filtros.ano) : undefined,
        lojaId: filtros.lojaId || undefined
      });
      setVeiculos(resposta.itens);
    } catch (error) {
      console.error("Falha na busca", error);
      setFeedback("Erro ao buscar veículos. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCriarVeiculo = async () => {
    try {
      const resultado = await estoqueService.criarVeiculo({
        placa: "NOVO-0000",
        modeloNome: "Modelo piloto",
        precoVenal: 0
      });
      setFeedback(`Veículo criado com ID ${resultado.veiculoId}.`);
      await carregarEstoque();
    } catch (error) {
      console.error("Falha ao criar veículo", error);
      setFeedback("Não foi possível criar o veículo.");
    }
  };

  const handleImportarPlanilha = async () => {
    try {
      const protocolo = await estoqueService.importarEstoque(`arquivo-${Date.now()}`);
      setFeedback(`Importação em andamento. Protocolo ${protocolo.protocolo}.`);
    } catch (error) {
      console.error("Falha na importação", error);
      setFeedback("Não foi possível importar a planilha.");
    }
  };

  const handleDuplicar = async (id: string) => {
    try {
      const resultado = await estoqueService.duplicarVeiculo(id);
      setFeedback(`Veículo duplicado com ID ${resultado.novoVeiculoId}.`);
      await carregarEstoque();
    } catch (error) {
      console.error("Erro ao duplicar veículo", error);
      setFeedback("Não foi possível duplicar o veículo.");
    }
  };

  const handleArquivar = async (id: string) => {
    try {
      await estoqueService.arquivarVeiculo(id);
      setFeedback("Veículo arquivado com sucesso.");
      await carregarEstoque();
    } catch (error) {
      console.error("Erro ao arquivar veículo", error);
      setFeedback("Não foi possível arquivar o veículo.");
    }
  };

  const handleAbrirDetalhe = (id: string) => {
    router.push(`/app/estoque/${id}`);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "Sem preço";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatStatus = (status: string | null | undefined) => {
    switch (status) {
      case "disponivel":
        return "Disponível";
      case "reservado":
        return "Reservado";
      case "vendido":
        return "Vendido";
      default:
        return status ?? "Sem status";
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão de estoque"
        description="Dados conectados ao serviço de inventário prontos para automações."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="gap-2" onClick={handleCriarVeiculo}>
              <Plus className="h-4 w-4" />
              Novo veículo
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleImportarPlanilha}>
              <FileUp className="h-4 w-4" />
              Importar planilha
            </Button>
          </div>
        }
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-4">
          <CardTitle>Filtros rápidos</CardTitle>
          <CardDescription>Conectado à busca incremental do estoque.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleBuscar}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  value={filtros.termo ?? ""}
                  onChange={(event) => setFiltros((prev) => ({ ...prev, termo: event.target.value }))}
                  placeholder="Buscar por placa, modelo ou descrição"
                  className="h-11 flex-1 border-0 bg-transparent px-0 focus:border-0 focus:ring-0"
                  disabled={isSearching}
                />
              </div>
              <Button type="submit" variant="outline" className="gap-2 text-sm" disabled={isSearching}>
                {isSearching ? "Buscando..." : "Aplicar filtros"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-sm"
                onClick={() => setMostrarFiltrosAvancados((value) => !value)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Ajustar filtros
              </Button>
            </div>
            {mostrarFiltrosAvancados ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="filtro-cor">
                    Cor
                  </label>
                  <Input
                    id="filtro-cor"
                    value={filtros.cor ?? ""}
                    onChange={(event) => setFiltros((prev) => ({ ...prev, cor: event.target.value }))}
                    placeholder="Ex.: Branco"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="filtro-ano">
                    Ano
                  </label>
                  <Input
                    id="filtro-ano"
                    value={filtros.ano ?? ""}
                    onChange={(event) => setFiltros((prev) => ({ ...prev, ano: event.target.value }))}
                    placeholder="Ex.: 2023"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="filtro-loja">
                    Loja
                  </label>
                  <Input
                    id="filtro-loja"
                    value={filtros.lojaId ?? ""}
                    onChange={(event) => setFiltros((prev) => ({ ...prev, lojaId: event.target.value }))}
                    placeholder="Identificador da loja"
                  />
                </div>
              </div>
            ) : null}
          </form>
          {feedback ? <p className="mt-4 text-xs text-slate-400">{feedback}</p> : null}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader>
          <CardTitle>Veículos</CardTitle>
          <CardDescription>Listagem pronta para conectar com tabelas ou visualizações dinâmicas.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-400">Carregando estoque...</p>
          ) : veiculos.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {veiculos.map(({ id, placa, modeloNome, modeloMarca, estadoVenda, precoVenal }) => (
                <div key={id} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{placa}</span>
                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-200">
                      {formatStatus(estadoVenda)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{modeloMarca ?? modeloNome ?? "Modelo não informado"}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(precoVenal)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleAbrirDetalhe(id)}>
                      Detalhes
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleDuplicar(id)}>
                      <Copy className="h-3 w-3" />
                      Duplicar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-rose-200 hover:text-rose-100"
                      onClick={() => handleArquivar(id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      Arquivar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Nenhum veículo encontrado para o filtro atual.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
