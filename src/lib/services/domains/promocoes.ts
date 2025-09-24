import { readClient, scopeFromLoja, writeClient } from "../core";
import type {
  PromocaoResumo,
  PromocaoTabelaEntrada,
  PromocoesFiltro
} from "@/types/domain";

export async function listarTabelaDePrecos(
  lojaId: string,
  filtros: Partial<PromocoesFiltro> = {}
): Promise<PromocaoTabelaEntrada[]> {
  const scope = scopeFromLoja(lojaId);
  return readClient.fetch("promocoes.tabelaPrecos", { ...filtros, lojaId } as PromocoesFiltro, scope);
}

export async function listarCampanhas(lojaId: string, filtros: Partial<PromocoesFiltro> = {}): Promise<PromocaoResumo[]> {
  const scope = scopeFromLoja(lojaId);
  return readClient.fetch("promocoes.campanhas", { ...filtros, lojaId } as PromocoesFiltro, scope);
}

export async function aplicarAjustePromocional(lojaId: string, veiculoId: string, precoPromocional: number) {
  return writeClient.execute(
    "promocoes.aplicarAjuste",
    { lojaId, veiculoId, precoPromocional },
    scopeFromLoja(lojaId)
  );
}

export async function atualizarPromocao(lojaId: string, promocaoId: string, dados: Partial<PromocaoTabelaEntrada>) {
  return writeClient.execute(
    "promocoes.atualizar",
    { lojaId, promocaoId, dados },
    scopeFromLoja(lojaId)
  );
}

export async function reverterPromocao(lojaId: string, veiculoId: string) {
  return writeClient.execute(
    "promocoes.reverter",
    { lojaId, veiculoId },
    scopeFromLoja(lojaId)
  );
}
