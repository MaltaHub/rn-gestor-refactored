// Auto-generated from schema.sql for runtime typings
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export interface AnunciosRow {
  preco_original: number | null;
  empresa_id: string;
  id: string;
  atualizado_em: string | null;
  link_anuncio: string | null;
  tipo_identificador_fisico: string | null;
  identificador_fisico: string | null;
  status: string | null;
  descricao_original: string | null;
  descricao: string | null;
  titulo_original: string | null;
  data_publicacao: string | null;
  data_vencimento: string | null;
  visualizacoes: number | null;
  favoritos: number | null;
  mensagens: number | null;
  criado_em: string | null;
  plataforma_id: string;
  preco: number | null;
  titulo: string;
  tipo_anuncio: string;
  autor_id: string | null;
  entidade_id: string;
  loja_id: string | null;
}

export interface DocumentacaoVeiculosRow {
  tem_multas: boolean | null;
  observacoes_multas: string | null;
  observacoes_gerais: string | null;
  aprovada_vistoria: boolean | null;
  data_vistoria: string | null;
  vistoria_realizada: boolean | null;
  responsavel_id: string | null;
  data_entrada: string | null;
  data_conclusao: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
  observacoes_restricoes: string | null;
  data_transferencia: string | null;
  transferencia_concluida: boolean | null;
  transferencia_iniciada: boolean | null;
  tem_restricoes: boolean | null;
  tem_embargos: boolean | null;
  tem_precatorios: boolean | null;
  valor_dividas_ativas: number | null;
  tem_dividas_ativas: boolean | null;
  valor_multas: number | null;
  tem_manual: boolean | null;
  tem_chave_reserva: boolean | null;
  tem_nf_compra: boolean | null;
  tem_crv: boolean | null;
  tem_crlv: boolean | null;
  status_geral: string;
  loja_id: string | null;
  veiculo_id: string;
  empresa_id: string;
  id: string;
}

export interface EmpresasRow {
  dominio: string | null;
  id: string;
  ativo: boolean | null;
  criado_em: string | null;
  nome: string;
  atualizado_em: string | null;
}

export interface FotosMetadadosRow {
  empresa_id: string;
  veiculo_id: string;
  loja_id: string;
  e_capa: boolean;
  criado_em: string;
  atualizado_em: string;
  path: string;
  ordem: number;
  id: string;
}

export interface LojasRow {
  id: string;
  nome: string;
  empresa_id: string;
}

export interface ModelosRow {
  ano_final: number | null;
  ano_inicial: number | null;
  id: string;
  motor: string | null;
  edicao: string | null;
  nome: string;
  marca: string;
  portas: number | null;
  lugares: number | null;
  valvulas: number | null;
  cilindros: number | null;
  tipo_cambio: string | null;
  combustivel: string | null;
  carroceria: string | null;
  empresa_id: string;
  tracao: string | null;
  cabine: string | null;
  cambio: string | null;
  atualizado_em: string | null;
  criado_em: string | null;
}

export interface PlataformasRow {
  empresa_id: string;
  nome: string;
  id: string;
}

export interface PromocoesRow {
  anuncio_id: string | null;
  preco_promocional: number;
  data_inicio: string;
  data_fim: string | null;
  autor_id: string;
  ativo: boolean | null;
  criado_em: string | null;
  atualizado_em: string | null;
  empresa_id: string;
  tipo_promocao: string;
  id: string;
  veiculo_loja_id: string | null;
}

export interface TemFotosRow {
  veiculo_id: string;
  loja_id: string;
  qtd_fotos: number;
  ultima_atualizacao: string;
  empresa_id: string;
}

export interface VeiculosRow {
  registrado_em: string;
  editado_por: string;
  editado_em: string;
  registrado_por: string;
  preco_venal: number | null;
  estado_venda: string;
  estado_veiculo: string | null;
  ano_modelo: number | null;
  ano_fabricacao: number | null;
  hodometro: number;
  local_id: string | null;
  modelo_id: string | null;
  empresa_id: string;
  id: string;
  observacao: string | null;
  placa: string;
  cor: string;
  chassi: string | null;
  estagio_documentacao: string | null;
}

export interface VeiculosLojaRow {
  loja_id: string;
  id: string;
  empresa_id: string;
  data_entrada: string;
  veiculo_id: string;
  preco: number | null;
}

export interface VendasRow {
  data_previsao_entrega: string | null;
  data_entrega: string | null;
  data_venda: string;
  valor_seguro: number | null;
  tem_seguro: boolean | null;
  observacoes: string | null;
  seguradora: string | null;
  valor_parcela: number | null;
  cliente_nome: string;
  numero_parcelas: number | null;
  forma_pagamento: string;
  valor_financiado: number | null;
  preco_entrada: number | null;
  preco_venda: number;
  vendedor_id: string;
  veiculo_id: string;
  atualizado_por: string | null;
  loja_id: string;
  cliente_cpf_cnpj: string;
  cliente_telefone: string | null;
  cliente_email: string | null;
  instituicao_financeira: string | null;
  id: string;
  cliente_endereco: string | null;
  empresa_id: string;
  criado_por: string;
  atualizado_em: string | null;
  criado_em: string | null;
  comissao_loja: number | null;
  comissao_vendedor: number | null;
  status_venda: string;
}
