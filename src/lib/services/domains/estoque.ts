import { readClient, scopeFromLoja, writeClient } from "../core";
import type {
  EstoqueFiltro,
  VehicleDetail,
  VehicleListResponse,
  VehicleSummary
} from "@/types/domain";

export async function listarEstoque(filtros: Partial<EstoqueFiltro> = {}): Promise<VehicleListResponse> {
  return readClient.fetch("estoque.listar", filtros as EstoqueFiltro);
}

export async function buscarNoEstoque(filtros: Partial<EstoqueFiltro> = {}): Promise<VehicleListResponse> {
  return readClient.fetch("estoque.buscar", filtros as EstoqueFiltro);
}

export async function listarVeiculosRecentes(limite?: number): Promise<VehicleSummary[]> {
  return readClient.fetch("estoque.recentes", { limite });
}

export async function obterDetalhesDoVeiculo(id: string, lojaId?: string) {
  return readClient.fetch("estoque.detalhes", { id }, scopeFromLoja(lojaId));
}

export async function criarVeiculo(dados: Partial<VehicleDetail>) {
  return writeClient.execute("estoque.criar", { dados });
}

export async function importarEstoque(arquivoId: string) {
  return writeClient.execute("estoque.importarLote", { arquivoId });
}

export async function duplicarVeiculo(idVeiculo: string) {
  return writeClient.execute("estoque.duplicar", { idVeiculo });
}

export async function arquivarVeiculo(idVeiculo: string) {
  return writeClient.execute("estoque.arquivar", { idVeiculo });
}

export async function atualizarVeiculo(idVeiculo: string, dados: Partial<VehicleDetail>) {
  return writeClient.execute("estoque.atualizar", { idVeiculo, dados });
}

export async function gerenciarMidiaDoVeiculo(idVeiculo: string, lojaId: string, fotos: string[]) {
  return writeClient.execute("estoque.gerenciarMidia", { idVeiculo, lojaId, fotos }, scopeFromLoja(lojaId));
}
