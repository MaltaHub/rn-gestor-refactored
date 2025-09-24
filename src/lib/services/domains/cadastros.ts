import { readClient, writeClient } from "../core";
import type {
  CadastroContexto,
  CadastroItem,
  ModeloDetalhe
} from "@/types/domain";

export async function listarContextos(): Promise<CadastroContexto[]> {
  return readClient.fetch("cadastros.contextos");
}

export async function listarCadastros(tipo: CadastroContexto["tipo"]): Promise<CadastroItem[]> {
  return readClient.fetch("cadastros.listar", { tipo });
}

export async function salvarCadastro(
  tipo: CadastroContexto["tipo"],
  item: Partial<CadastroItem>
) {
  return writeClient.execute("cadastros.salvar", { tipo, item });
}

export async function excluirCadastro(tipo: CadastroContexto["tipo"], id: string) {
  return writeClient.execute("cadastros.excluir", { tipo, id });
}

export async function detalharModelo(id: string): Promise<ModeloDetalhe | null> {
  return readClient.fetch("modelos.detalhes", { id });
}

export async function criarModelo(dados: Partial<ModeloDetalhe>) {
  return writeClient.execute("modelos.criar", { dados });
}

export async function atualizarModelo(id: string, dados: Partial<ModeloDetalhe>) {
  return writeClient.execute("modelos.atualizar", { id, dados });
}

export async function removerModelo(id: string) {
  return writeClient.execute("modelos.remover", { id });
}
