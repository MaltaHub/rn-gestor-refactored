CREATE TABLE public.anuncios (
  preco_original numeric,
  empresa_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  atualizado_em timestamp with time zone DEFAULT now(),
  link_anuncio character varying,
  tipo_identificador_fisico character varying,
  identificador_fisico character varying,
  status character varying DEFAULT 'ativo'::character varying,
  descricao_original text,
  descricao text,
  titulo_original character varying,
  data_publicacao timestamp with time zone,
  data_vencimento timestamp with time zone,
  visualizacoes integer DEFAULT 0,
  favoritos integer DEFAULT 0,
  mensagens integer DEFAULT 0,
  criado_em timestamp with time zone DEFAULT now(),
  plataforma_id uuid NOT NULL,
  preco numeric,
  titulo character varying NOT NULL,
  tipo_anuncio character varying NOT NULL,
  autor_id uuid,
  entidade_id uuid NOT NULL,
  loja_id uuid
);                                                                                                                                                                                                                                                                                                                                                                                                                      |
| CREATE TABLE public.caracteristicas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  nome character varying NOT NULL
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE TABLE public.caracteristicas_repetidos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  caracteristica_id uuid NOT NULL,
  repetido_id uuid NOT NULL,
  empresa_id uuid NOT NULL
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CREATE TABLE public.caracteristicas_veiculos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  veiculo_id uuid NOT NULL,
  caracteristica_id uuid NOT NULL
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| CREATE TABLE public.convites_empresa (
  usuario_convidado_id uuid NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  status character varying DEFAULT 'pendente'::character varying,
  expira_em timestamp with time zone NOT NULL,
  token character varying NOT NULL DEFAULT (gen_random_uuid())::text,
  consumido_em timestamp with time zone,
  convidado_por_usuario_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE TABLE public.documentacao_veiculos (
  tem_multas boolean DEFAULT false,
  observacoes_multas text,
  observacoes_gerais text,
  aprovada_vistoria boolean DEFAULT false,
  data_vistoria timestamp with time zone,
  vistoria_realizada boolean DEFAULT false,
  responsavel_id uuid,
  data_entrada timestamp with time zone DEFAULT now(),
  data_conclusao timestamp with time zone,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  observacoes_restricoes text,
  data_transferencia timestamp with time zone,
  transferencia_concluida boolean DEFAULT false,
  transferencia_iniciada boolean DEFAULT false,
  tem_restricoes boolean DEFAULT false,
  tem_embargos boolean DEFAULT false,
  tem_precatorios boolean DEFAULT false,
  valor_dividas_ativas numeric DEFAULT 0,
  tem_dividas_ativas boolean DEFAULT false,
  valor_multas numeric DEFAULT 0,
  tem_manual boolean DEFAULT false,
  tem_chave_reserva boolean DEFAULT false,
  tem_nf_compra boolean DEFAULT false,
  tem_crv boolean DEFAULT false,
  tem_crlv boolean DEFAULT false,
  status_geral USER-DEFINED NOT NULL DEFAULT 'pendente'::status_documentacao,
  loja_id uuid,
  veiculo_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
); |
| CREATE TABLE public.empresas (
  dominio character varying,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ativo boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now(),
  nome character varying NOT NULL,
  atualizado_em timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CREATE TABLE public.fotos_metadados (
  empresa_id uuid NOT NULL,
  veiculo_id uuid NOT NULL,
  loja_id uuid NOT NULL,
  e_capa boolean NOT NULL DEFAULT false,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  atualizado_em timestamp with time zone NOT NULL DEFAULT now(),
  path character varying NOT NULL,
  ordem smallint NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CREATE TABLE public.locais (
  nome character varying NOT NULL,
  empresa_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CREATE TABLE public.lojas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  empresa_id uuid NOT NULL
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CREATE TABLE public.membros_empresa (
  criado_em timestamp with time zone DEFAULT now(),
  ativo boolean DEFAULT true,
  papel USER-DEFINED DEFAULT 'usuario'::papel_usuario_empresa,
  usuario_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| CREATE TABLE public.modelos (
  ano_final integer,
  ano_inicial integer,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  motor character varying,
  edicao character varying,
  nome character varying NOT NULL,
  marca character varying NOT NULL,
  portas integer,
  lugares integer,
  valvulas integer,
  cilindros integer,
  tipo_cambio USER-DEFINED,
  combustivel USER-DEFINED,
  carroceria USER-DEFINED,
  empresa_id uuid NOT NULL,
  tracao character varying,
  cabine character varying,
  cambio character varying,
  atualizado_em timestamp with time zone DEFAULT now(),
  criado_em timestamp with time zone DEFAULT now()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| CREATE TABLE public.permissoes_papel (
  atualizado_por uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  papel USER-DEFINED NOT NULL,
  permitido boolean NOT NULL DEFAULT true,
  condicoes_extras jsonb,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  criado_por uuid,
  operacao text NOT NULL
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CREATE TABLE public.plataformas (
  empresa_id uuid NOT NULL,
  nome character varying NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid()
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| CREATE TABLE public.promocoes (
  anuncio_id uuid,
  preco_promocional numeric NOT NULL,
  data_inicio timestamp with time zone NOT NULL,
  data_fim timestamp with time zone,
  autor_id uuid NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  empresa_id uuid NOT NULL,
  tipo_promocao character varying NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  veiculo_loja_id uuid
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| CREATE TABLE public.repetidos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cor_padrao character varying NOT NULL,
  min_hodometro integer NOT NULL,
  ano_modelo_padrao integer NOT NULL,
  ano_fabricacao_padrao integer NOT NULL,
  modelo_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  alterado_por uuid,
  alterado_em timestamp with time zone DEFAULT now(),
  registrado_por uuid,
  registrado_em timestamp with time zone DEFAULT now(),
  max_hodometro integer NOT NULL
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CREATE TABLE public.tem_fotos (
  veiculo_id uuid NOT NULL,
  loja_id uuid NOT NULL,
  qtd_fotos smallint NOT NULL DEFAULT 0,
  ultima_atualizacao timestamp with time zone NOT NULL DEFAULT now(),
  empresa_id uuid NOT NULL
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| CREATE TABLE public.veiculos (
  registrado_em timestamp with time zone NOT NULL DEFAULT now(),
  editado_por uuid NOT NULL DEFAULT auth.uid(),
  editado_em timestamp with time zone NOT NULL DEFAULT now(),
  registrado_por uuid NOT NULL DEFAULT auth.uid(),
  preco_venal numeric,
  estado_venda USER-DEFINED NOT NULL,
  estado_veiculo USER-DEFINED,
  ano_modelo integer,
  ano_fabricacao integer,
  hodometro integer NOT NULL,
  local_id uuid,
  modelo_id uuid,
  empresa_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  observacao text,
  placa character varying NOT NULL,
  cor character varying NOT NULL,
  chassi character varying,
  estagio_documentacao character varying
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| CREATE TABLE public.veiculos_loja (
  loja_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  data_entrada timestamp with time zone NOT NULL DEFAULT now(),
  veiculo_id uuid NOT NULL,
  preco numeric
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CREATE TABLE public.veiculos_repetidos (
  criado_em timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  repetido_id uuid NOT NULL,
  veiculo_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  similaridade_score numeric
);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CREATE TABLE public.vendas (
  data_previsao_entrega timestamp with time zone,
  data_entrega timestamp with time zone,
  data_venda timestamp with time zone NOT NULL DEFAULT now(),
  valor_seguro numeric,
  tem_seguro boolean DEFAULT false,
  observacoes text,
  seguradora character varying,
  valor_parcela numeric,
  cliente_nome character varying NOT NULL,
  numero_parcelas integer,
  forma_pagamento USER-DEFINED NOT NULL,
  valor_financiado numeric DEFAULT 0,
  preco_entrada numeric DEFAULT 0,
  preco_venda numeric NOT NULL,
  vendedor_id uuid NOT NULL,
  veiculo_id uuid NOT NULL,
  atualizado_por uuid,
  loja_id uuid NOT NULL,
  cliente_cpf_cnpj character varying NOT NULL,
  cliente_telefone character varying,
  cliente_email character varying,
  instituicao_financeira character varying,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cliente_endereco text,
  empresa_id uuid NOT NULL,
  criado_por uuid NOT NULL,
  atualizado_em timestamp with time zone DEFAULT now(),
  criado_em timestamp with time zone DEFAULT now(),
  comissao_loja numeric,
  comissao_vendedor numeric,
  status_venda USER-DEFINED NOT NULL DEFAULT 'negociacao'::status_venda
);|