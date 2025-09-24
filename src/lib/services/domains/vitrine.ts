import { readClient, scopeFromLoja, writeClient } from "../core";
import type {
  VitrineDetalhe,
  VitrineDisponivelResumo,
  VitrineFiltro,
  VitrineRelacionamento,
  VitrineResumo
} from "@/types/domain";

export async function listarVitrine(
  filtros: Partial<VitrineFiltro> = {},
  lojaId?: string
): Promise<VitrineResumo[]> {
  const scope = scopeFromLoja(lojaId ?? filtros.lojaId);
  return readClient.fetch("vitrine.listar", filtros as VitrineFiltro, scope);
}

export async function listarDisponiveis(
  filtros: Partial<VitrineFiltro> = {},
  lojaId?: string
): Promise<VitrineDisponivelResumo[]> {
  const scope = scopeFromLoja(lojaId ?? filtros.lojaId);
  return readClient.fetch("vitrine.disponiveis", filtros as VitrineFiltro, scope);
}

export async function obterResumo(
  veiculoId: string,
  lojaId?: string
): Promise<VitrineResumo | null> {
  return readClient.fetch("vitrine.resumo", { veiculoId }, scopeFromLoja(lojaId));
}

export async function obterDetalhes(
  veiculoId: string,
  lojaId?: string
): Promise<VitrineDetalhe | null> {
  return readClient.fetch("vitrine.detalhes", { veiculoId }, scopeFromLoja(lojaId));
}

export async function listarRelacionamentos(
  lojaId?: string
): Promise<VitrineRelacionamento[]> {
  return readClient.fetch("vitrine.relacionamentos", { lojaId }, scopeFromLoja(lojaId));
}

export async function removerDaVitrine(veiculoId: string, lojaId: string) {
  return writeClient.execute("vitrine.removerVeiculo", { veiculoId, lojaId }, scopeFromLoja(lojaId));
}

export async function adicionarAVitrine(veiculoId: string, lojaId: string) {
  return writeClient.execute("vitrine.adicionarVeiculo", { veiculoId, lojaId }, scopeFromLoja(lojaId));
}
