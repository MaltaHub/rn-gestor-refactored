import { readClient, scopeFromLoja, writeClient } from "../core";
import type {
  AnuncioAgrupado,
  AnuncioDetalhe,
  AnunciosFiltro,
  AnuncioResumo
} from "@/types/domain";

export async function listarPorPlataforma(
  filtros: Partial<AnunciosFiltro> = {},
  lojaId?: string
): Promise<AnuncioAgrupado[]> {
  return readClient.fetch("anuncios.listarPorPlataforma", filtros as AnunciosFiltro, scopeFromLoja(lojaId));
}

export async function listarAnuncios(
  filtros: Partial<AnunciosFiltro> = {},
  lojaId?: string
): Promise<AnuncioResumo[]> {
  return readClient.fetch("anuncios.listar", filtros as AnunciosFiltro, scopeFromLoja(lojaId));
}

export async function obterDetalhesAnuncio(
  vehicleId: string,
  platformId: string,
  lojaId?: string
): Promise<AnuncioDetalhe | null> {
  return readClient.fetch("anuncios.detalhes", { vehicleId, platformId }, scopeFromLoja(lojaId));
}

export async function publicarAnuncio(
  veiculoId: string,
  plataformaId: string,
  lojaId: string
) {
  return writeClient.execute(
    "anuncios.publicar",
    { veiculoId, plataformaId, lojaId },
    scopeFromLoja(lojaId)
  );
}

export async function atualizarAnuncio(
  veiculoId: string,
  plataformaId: string,
  lojaId: string,
  dados: Partial<AnuncioDetalhe>
) {
  return writeClient.execute(
    "anuncios.atualizar",
    { veiculoId, plataformaId, lojaId, dados },
    scopeFromLoja(lojaId)
  );
}

export async function removerAnuncio(veiculoId: string, plataformaId: string, lojaId: string) {
  return writeClient.execute(
    "anuncios.remover",
    { veiculoId, plataformaId, lojaId },
    scopeFromLoja(lojaId)
  );
}

export async function sincronizarAnunciosEmLote(arquivoId: string, lojaId: string) {
  return writeClient.execute(
    "anuncios.syncLote",
    { arquivoId, lojaId },
    scopeFromLoja(lojaId)
  );
}
