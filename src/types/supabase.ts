// types.ts

export interface Anuncio {
  criado_em?: string; // default: now()
  preco_original?: number | null;
  status?: string; // default: 'ativo'
  identificador_fisico?: string | null;
  tipo_identificador_fisico?: string | null;
  link_anuncio?: string | null;
  data_publicacao?: string | null;
  data_vencimento?: string | null;
  visualizacoes?: number; // default: 0
  favoritos?: number; // default: 0
  mensagens?: number; // default: 0
  atualizado_em?: string; // default: now()
  descricao?: string | null;
  descricao_original?: string | null;
  preco?: number | null;
  id?: string; // default: gen_random_uuid()
  empresa_id: string;
  loja_id?: string | null;
  entidade_id: string;
  tipo_anuncio: string;
  plataforma_id: string;
  autor_id?: string | null;
  titulo: string;
  titulo_original?: string | null;
}

export interface Caracteristica {
  id?: string; // default: gen_random_uuid()
  nome: string;
  empresa_id: string;
}

export interface CaracteristicaRepetido {
  empresa_id: string;
  id?: string; // default: gen_random_uuid()
  repetido_id: string;
  caracteristica_id: string;
}

export interface CaracteristicaVeiculo {
  empresa_id: string;
  caracteristica_id: string;
  id?: string; // default: gen_random_uuid()
  veiculo_id: string;
}

export interface ConviteEmpresa {
  id?: string; // default: gen_random_uuid()
  empresa_id: string;
  convidado_por_usuario_id: string;
  usuario_convidado_id: string;
  token?: string; // default: gen_random_uuid()::text
  status?: string; // default: 'pendente'
  criado_em?: string; // default: now()
  expira_em: string;
  consumido_em?: string | null;
}

export interface DocumentacaoVeiculo {
  tem_multas?: boolean; // default: false
  tem_manual?: boolean; // default: false
  tem_chave_reserva?: boolean; // default: false
  tem_nf_compra?: boolean; // default: false
  tem_crv?: boolean; // default: false
  tem_crlv?: boolean; // default: false
  status_geral?: string; // default: 'pendente'
  loja_id?: string | null;
  veiculo_id: string;
  empresa_id: string;
  id?: string; // default: gen_random_uuid()
  valor_multas?: number; // default: 0
  tem_dividas_ativas?: boolean; // default: false
  valor_dividas_ativas?: number; // default: 0
  tem_precatorios?: boolean; // default: false
  tem_embargos?: boolean; // default: false
  tem_restricoes?: boolean; // default: false
  transferencia_iniciada?: boolean; // default: false
  transferencia_concluida?: boolean; // default: false
  data_transferencia?: string | null;
  vistoria_realizada?: boolean; // default: false
  data_vistoria?: string | null;
  aprovada_vistoria?: boolean; // default: false
  observacoes_gerais?: string | null;
  observacoes_multas?: string | null;
  observacoes_restricoes?: string | null;
  responsavel_id?: string | null;
  data_entrada?: string; // default: now()
  data_conclusao?: string | null;
  criado_em?: string; // default: now()
  atualizado_em?: string; // default: now()
}

export interface Empresa {
  nome: string;
  dominio?: string | null;
  id?: string; // default: gen_random_uuid()
  atualizado_em?: string; // default: now()
  criado_em?: string; // default: now()
  ativo?: boolean; // default: true
}

export interface FotoMetadata {
  path: string;
  loja_id: string;
  empresa_id: string;
  id?: string; // default: gen_random_uuid()
  veiculo_id: string;
  ordem: number;
  atualizado_em?: string; // default: now()
  criado_em?: string; // default: now()
  e_capa?: boolean; // default: false
}

export interface Local {
  id?: string; // default: gen_random_uuid()
  empresa_id: string;
  nome: string;
}

export interface Loja {
  nome: string;
  id?: string; // default: gen_random_uuid()
  empresa_id: string;
}

export interface MembroEmpresa {
  id?: string; // default: gen_random_uuid()
  criado_em?: string; // default: now()
  ativo?: boolean; // default: true
  papel?: string; // default: 'usuario'
  usuario_id: string;
  empresa_id: string;
}

export interface Modelo {
  criado_em?: string; // default: now()
  cambio?: string | null;
  cilindros?: number | null;
  valvulas?: number | null;
  lugares?: number | null;
  portas?: number | null;
  cabine?: string | null;
  tracao?: string | null;
  ano_inicial?: number | null;
  ano_final?: number | null;
  atualizado_em?: string; // default: now()
  id?: string; // default: gen_random_uuid()
  empresa_id: string;
  marca: string;
  nome: string;
  edicao?: string | null;
  carroceria?: string | null;
  combustivel?: string | null;
  tipo_cambio?: string | null;
  motor?: string | null;
}

export interface PermissaoPapel {
  operacao: string;
  papel: string;
  empresa_id: string;
  id?: string; // default: gen_random_uuid()
  permitido?: boolean; // default: true
  condicoes_extras?: object | null;
  criado_em?: string; // default: now()
  atualizado_em?: string; // default: now()
  criado_por?: string | null;
  atualizado_por?: string | null;
}

export interface Plataforma {
  empresa_id: string;
  id?: string; // default: gen_random_uuid()
  nome: string;
}

export interface Promocao {
  anuncio_id?: string | null;
  veiculo_loja_id?: string | null;
  empresa_id: string;
  id?: string; // default: gen_random_uuid()
  atualizado_em?: string; // default: now()
  criado_em?: string; // default: now()
  ativo?: boolean; // default: true
  autor_id: string;
  data_fim?: string | null;
  data_inicio: string;
  preco_promocional: number;
  tipo_promocao: string;
}

export interface Repetido {
  alterado_por?: string | null;
  ano_fabricacao_padrao: number;
  ano_modelo_padrao: number;
  cor_padrao: string;
  min_hodometro: number;
  max_hodometro: number;
  registrado_em?: string; // default: now()
  registrado_por?: string | null;
  id?: string; // default: gen_random_uuid()
  empresa_id: string;
  modelo_id: string;
  alterado_em?: string; // default: now()
}

export interface TemFotos {
  qtd_fotos?: number; // default: 0
  empresa_id: string;
  veiculo_id: string;
  loja_id: string;
  ultima_atualizacao?: string; // default: now()
}

export interface Veiculo {
  chassi?: string | null;
  ano_modelo?: number | null;
  ano_fabricacao?: number | null;
  hodometro: number;
  cor: string;
  placa: string;
  local_id?: string | null;
  modelo_id?: string | null;
  empresa_id: string;
  id?: string; // default: gen_random_uuid()
  observacao?: string | null;
  registrado_em?: string; // default: now()
  estado_veiculo?: string | null;
  estado_venda: string;
  preco_venal?: number | null;
  estagio_documentacao?: string | null;
  editado_por?: string; // default: auth.uid()
  registrado_por?: string; // default: auth.uid()
  editado_em?: string; // default: now()
}

export interface VeiculoLoja {
  data_entrada?: string; // default: now()
  preco?: number | null;
  id?: string; // default: gen_random_uuid()
  empresa_id: string;
  veiculo_id: string;
  loja_id: string;
}

export interface VeiculoRepetido {
  veiculo_id: string;
  repetido_id: string;
  similaridade_score?: number | null;
  criado_em?: string; // default: now()
  id?: string; // default: gen_random_uuid()
  empresa_id: string;
}

export interface Venda {
  seguradora?: string | null;
  valor_seguro?: number | null;
  data_venda?: string; // default: now()
  data_entrega?: string | null;
  data_previsao_entrega?: string | null;
  status_venda?: string; // default: 'negociacao'
  observacoes?: string | null;
  comissao_vendedor?: number | null;
  comissao_loja?: number | null;
  criado_em?: string; // default: now()
  atualizado_em?: string; // default: now()
  criado_por: string;
  atualizado_por?: string | null;
  veiculo_id: string;
  loja_id: string;
  empresa_id: string;
  id?: string; // default: gen_random_uuid()
  cliente_nome: string;
  cliente_cpf_cnpj: string;
  cliente_telefone?: string | null;
  cliente_email?: string | null;
  cliente_endereco?: string | null;
  vendedor_id: string;
  preco_venda: number;
  valor_financiado?: number; // default: 0
  preco_entrada?: number; // default: 0
  forma_pagamento: string;
  instituicao_financeira?: string | null;
  numero_parcelas?: number | null;
  valor_parcela?: number | null;
  tem_seguro?: boolean; // default: false
}
