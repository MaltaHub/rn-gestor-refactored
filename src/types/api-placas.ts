/**
 * Tipagens alinhadas com a Edge Function `api-placas`.
 * A função encapsula a resposta da API apiplacas.com.br e adiciona metadados.
 */

export type ApiPlacasRawResponse = Record<string, unknown>;

export type ApiPlacasExtra = {
  ano_fabricacao?: number | string | null;
  ano_modelo?: number | string | null;
  municipio?: string | null;
  uf?: string | null;
  restricao?: string | null;
  proprietario_anterior?: string | null;
  data_consulta?: string | null;
  data_atualizacao?: string | null;
  ultima_ocorrencia?: string | null;
  renavam?: string | null;
  procedencia?: string | null;
  procedencia_detalhe?: string | null;
  importado?: boolean | null;
  roubado?: boolean | null;
  frotista?: boolean | null;
  [key: string]: unknown;
};

export interface ApiPlacasFipeOption {
  ano_modelo?: string | number | null;
  codigo?: string | null;
  codigo_fipe?: string | null;
  codigo_marca?: number | string | null;
  codigo_modelo?: string | number | null;
  combustivel?: string | null;
  id_valor?: number | string | null;
  mes_referencia?: string | null;
  referencia_fipe?: number | string | null;
  score?: number | string | null;
  sigla_combustivel?: string | null;
  texto_marca?: string | null;
  texto_modelo?: string | null;
  texto_valor?: string | null;
  tipo_modelo?: number | string | null;
  preco?: string | null;
  [key: string]: unknown;
}

export type ApiPlacasFipeBlock = {
  dados?: ApiPlacasFipeOption[] | null;
  opcoes?: ApiPlacasFipeOption[] | null;
  itens?: ApiPlacasFipeOption[] | null;
  resultado?: ApiPlacasFipeOption[] | null;
  melhores?: ApiPlacasFipeOption[] | null;
  [key: string]: unknown;
};

export type ApiPlacasFipe =
  | ApiPlacasFipeOption
  | ApiPlacasFipeOption[]
  | ApiPlacasFipeBlock
  | null;

export interface ConsultaPlacaRequest {
  placa: string;
}

export interface EdgeConsultaPlacaSuccess {
  placa: string;
  uf: string | null;
  marca: string | null;
  modelo: string | null;
  ano: string | number | null;
  cor: string | null;
  situacao: string | null;
  extra: ApiPlacasExtra | null;
  fipe: ApiPlacasFipe;
  raw: ApiPlacasRawResponse;
}

export interface EdgeConsultaPlacaError {
  error: string;
  detail?: string | null;
}

export type EdgeConsultaPlacaResponse = EdgeConsultaPlacaSuccess | EdgeConsultaPlacaError;

export interface ConsultaPlacaResult extends EdgeConsultaPlacaSuccess {
  ano_modelo?: string | number | null;
  municipio?: string | null;
  mensagem?: string | null;
  sucesso?: boolean | null;
  fipeOpcoes: ApiPlacasFipeOption[] | null;
  bestFipe: ApiPlacasFipeOption | null;
}
