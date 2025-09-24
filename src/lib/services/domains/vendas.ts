import { readClient, scopeFromLoja, writeClient } from "../core";
import type {
  AnaliseComparativa,
  PipelineResumo,
  VendaDetalhe,
  VendaInsight,
  VendaResumo,
  VendasFiltro
} from "@/types/domain";

export async function obterInsights(filtros: Partial<VendasFiltro> = {}): Promise<VendaInsight> {
  return readClient.fetch("vendas.insights", filtros as VendasFiltro);
}

export async function listarVendasRecentes(filtros: Partial<VendasFiltro> = {}): Promise<VendaResumo[]> {
  return readClient.fetch("vendas.recentes", filtros as VendasFiltro);
}

export async function listarPipeline(filtros: Partial<VendasFiltro> = {}): Promise<PipelineResumo[]> {
  return readClient.fetch("vendas.pipeline", filtros as VendasFiltro);
}

export async function listarAnalisesComparativas(filtros: Partial<VendasFiltro> = {}): Promise<AnaliseComparativa[]> {
  return readClient.fetch("vendas.analisesComparativas", filtros as VendasFiltro);
}

export async function obterDetalhesDaVenda(id: string): Promise<VendaDetalhe | null> {
  return readClient.fetch("vendas.detalhes", { id });
}

export async function registrarVenda(dados: Partial<VendaDetalhe>, lojaId: string) {
  return writeClient.execute("vendas.registrar", { dados, lojaId }, scopeFromLoja(lojaId));
}

export async function atualizarVenda(id: string, dados: Partial<VendaDetalhe>, lojaId: string) {
  return writeClient.execute("vendas.atualizar", { id, dados, lojaId }, scopeFromLoja(lojaId));
}
