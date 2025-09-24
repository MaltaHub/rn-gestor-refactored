import type {
  AnunciosRow,
  DocumentacaoVeiculosRow,
  EmpresasRow,
  FotosMetadadosRow,
  LojasRow,
  ModelosRow,
  PlataformasRow,
  PromocoesRow,
  VeiculosLojaRow,
  VeiculosRow,
  VendasRow
} from "./database";

export interface MarketingHeroContent {
  title: string;
  subtitle: string;
  ctaLabel: string;
  imageUrl?: string;
}

export interface MarketingDifferential {
  id: string;
  title: string;
  description: string;
  highlight?: string;
}

export interface EmpresaResumo {
  id: EmpresasRow["id"];
  nome: EmpresasRow["nome"];
  dominio?: EmpresasRow["dominio"];
  ativo?: EmpresasRow["ativo"];
}

export interface EmpresaVinculo {
  empresaId: EmpresasRow["id"];
  empresaNome: EmpresasRow["nome"];
  lojaPadraoId: string | null;
  lojas: LojaResumo[];
  perfilCompleto: boolean;
}

export interface LojaResumo {
  id: LojasRow["id"];
  nome: LojasRow["nome"];
  empresaId: LojasRow["empresa_id"];
  cidade?: string;
  uf?: string;
  ativa?: boolean | null;
}

export interface ConviteValidacao {
  valido: boolean;
  empresa?: EmpresaResumo;
  expiraEm?: string;
  mensagem?: string;
}

export interface ConcessionariaContexto {
  empresa: EmpresaResumo;
  lojas: LojaResumo[];
  estoqueCompartilhado: boolean;
  lojaAtualId?: string | null;
}

export interface PermissaoModulo {
  slug: string;
  permitido: boolean;
  motivo?: string;
}

export interface DashboardMetrics {
  cards: MetricCard[];
  totalVeiculos: number;
  lojasAtivas: number;
  vendasUltimos7Dias: number;
  atualizacaoEm: string;
}

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  trend?: "up" | "down" | "steady";
  trendValue?: string;
}

export interface VehicleSummary {
  id: VeiculosRow["id"];
  empresaId: VeiculosRow["empresa_id"];
  placa: VeiculosRow["placa"];
  cor: VeiculosRow["cor"];
  estadoVenda: VeiculosRow["estado_venda"];
  hodometro: VeiculosRow["hodometro"];
  anoModelo?: VeiculosRow["ano_modelo"];
  anoFabricacao?: VeiculosRow["ano_fabricacao"];
  precoVenal?: VeiculosRow["preco_venal"];
  modeloId?: VeiculosRow["modelo_id"];
  modeloNome?: ModelosRow["nome"];
  modeloMarca?: ModelosRow["marca"];
  lojaId?: VeiculosLojaRow["loja_id"] | null;
  lojaNome?: LojasRow["nome"];
  precoAnuncio?: AnunciosRow["preco"];
  anuncioStatus?: AnunciosRow["status"];
  anuncioTitulo?: AnunciosRow["titulo"];
  anuncioAtualizadoEm?: AnunciosRow["atualizado_em"];
}

export interface VehicleListResponse {
  itens: VehicleSummary[];
  total: number;
  pagina: number;
  porPagina: number;
}

export interface VehicleMediaItem {
  id: FotosMetadadosRow["id"];
  path: FotosMetadadosRow["path"];
  ordem: FotosMetadadosRow["ordem"];
  eCapa: FotosMetadadosRow["e_capa"];
  atualizadoEm: FotosMetadadosRow["atualizado_em"];
}

export interface VehicleMediaByLoja {
  lojaId: LojasRow["id"];
  lojaNome?: LojasRow["nome"];
  fotos: VehicleMediaItem[];
  capaId?: VehicleMediaItem["id"];
}

export interface VehicleDetail extends VehicleSummary {
  estadoVeiculo?: VeiculosRow["estado_veiculo"];
  estagioDocumentacao?: VeiculosRow["estagio_documentacao"];
  observacao?: VeiculosRow["observacao"];
  documentacao?: DocumentacaoVeiculosRow | null;
  midiaPorLoja: VehicleMediaByLoja[];
}

export interface AnuncioAgrupado {
  plataformaId: PlataformasRow["id"] | string;
  plataformaNome: string;
  lojaId: AnunciosRow["loja_id"];
  veiculos: AnuncioResumo[];
}

export interface AnuncioResumo {
  id: AnunciosRow["id"];
  veiculoId: AnunciosRow["entidade_id"];
  plataformaId: AnunciosRow["plataforma_id"];
  lojaId?: AnunciosRow["loja_id"];
  titulo: AnunciosRow["titulo"];
  status?: AnunciosRow["status"];
  preco?: AnunciosRow["preco"];
  atualizadoEm?: AnunciosRow["atualizado_em"];
  tipo: AnunciosRow["tipo_anuncio"];
}

export interface AnuncioDetalhe extends AnuncioResumo {
  descricao?: AnunciosRow["descricao"];
  descricaoOriginal?: AnunciosRow["descricao_original"];
  tituloOriginal?: AnunciosRow["titulo_original"];
  link?: AnunciosRow["link_anuncio"];
  tipoIdentificador?: AnunciosRow["tipo_identificador_fisico"];
  identificador?: AnunciosRow["identificador_fisico"];
  publicadoEm?: AnunciosRow["data_publicacao"];
  expiraEm?: AnunciosRow["data_vencimento"];
  metricas?: {
    visualizacoes?: AnunciosRow["visualizacoes"];
    favoritos?: AnunciosRow["favoritos"];
    mensagens?: AnunciosRow["mensagens"];
  };
}

export interface VendaResumo {
  id: VendasRow["id"];
  veiculoId: VendasRow["veiculo_id"];
  lojaId: VendasRow["loja_id"];
  precoVenda: VendasRow["preco_venda"];
  status: VendasRow["status_venda"];
  dataVenda: VendasRow["data_venda"];
  clienteNome: VendasRow["cliente_nome"];
  atualizadoEm?: VendasRow["atualizado_em"];
}

export interface VendaDetalhe extends VendaResumo {
  formaPagamento: VendasRow["forma_pagamento"];
  valorEntrada?: VendasRow["preco_entrada"];
  valorFinanciado?: VendasRow["valor_financiado"];
  numeroParcelas?: VendasRow["numero_parcelas"];
  valorParcela?: VendasRow["valor_parcela"];
  temSeguro?: VendasRow["tem_seguro"];
  seguradora?: VendasRow["seguradora"];
  valorSeguro?: VendasRow["valor_seguro"];
  instituicaoFinanceira?: VendasRow["instituicao_financeira"];
  comissaoLoja?: VendasRow["comissao_loja"];
  comissaoVendedor?: VendasRow["comissao_vendedor"];
  observacoes?: VendasRow["observacoes"];
  clienteContato?: {
    documento: VendasRow["cliente_cpf_cnpj"];
    telefone?: VendasRow["cliente_telefone"];
    email?: VendasRow["cliente_email"];
    endereco?: VendasRow["cliente_endereco"];
  };
  datas?: {
    previsaoEntrega?: VendasRow["data_previsao_entrega"];
    entrega?: VendasRow["data_entrega"];
    criadoEm?: VendasRow["criado_em"];
  };
}

export interface VendaInsight {
  totalVendas: number;
  ticketMedio: number;
  desempenhoPorLoja: Record<string, number>;
  periodo: { inicio: string; fim: string };
}

export interface PipelineResumo {
  etapa: string;
  quantidade: number;
}

export interface AnaliseComparativa {
  label: string;
  valor: number;
  variacao?: number;
}

export interface PromocaoTabelaEntrada {
  id: PromocoesRow["id"];
  veiculoLojaId: PromocoesRow["veiculo_loja_id"];
  anuncioId: PromocoesRow["anuncio_id"];
  precoPromocional: PromocoesRow["preco_promocional"];
  dataInicio: PromocoesRow["data_inicio"];
  dataFim?: PromocoesRow["data_fim"];
  tipoPromocao: PromocoesRow["tipo_promocao"];
  ativo?: PromocoesRow["ativo"];
}

export interface PromocaoResumo extends PromocaoTabelaEntrada {
  lojaId?: VeiculosLojaRow["loja_id"] | null;
  veiculoId?: VeiculosLojaRow["veiculo_id"] | null;
}

export interface UsuarioPerfil {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
}

export interface UsuarioPreferencias {
  darkMode: boolean;
  notificacoesEmail: boolean;
  notificacoesSms: boolean;
  resumoSemanal: boolean;
}

export interface LojaDisponivel {
  id: LojaResumo["id"];
  nome: LojaResumo["nome"];
  empresaId: LojaResumo["empresaId"];
  cidade?: LojaResumo["cidade"];
  uf?: LojaResumo["uf"];
}

export interface CadastroContexto {
  tipo: "stores" | "characteristics" | "platforms" | "locations" | "models";
  label: string;
}

export interface CadastroItem {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface ModeloDetalhe {
  id: ModelosRow["id"];
  marca: ModelosRow["marca"];
  nome: ModelosRow["nome"];
  versao?: ModelosRow["edicao"];
  anoInicial?: ModelosRow["ano_inicial"];
  anoFinal?: ModelosRow["ano_final"];
  ativo: boolean;
}

export interface AvisoPendencia {
  id: string;
  tipo: "sem_foto" | "sem_anuncio" | "anuncio_desatualizado";
  veiculoId: string;
  lojaId?: string;
  descricao: string;
  criadoEm: string;
}

export interface OperacaoResultadoMock {
  origem: "mock";
  emitidoEm: string;
}

export interface OperacaoResultadoReal {
  origem: "api";
  emitidoEm: string;
}

export type OperacaoResultado = OperacaoResultadoMock | OperacaoResultadoReal;

export interface PaginacaoFiltro {
  pagina?: number;
  porPagina?: number;
}

export interface EstoqueFiltro extends PaginacaoFiltro {
  termo?: string;
  lojaId?: string;
  placa?: string;
  modeloId?: string;
  precoMinimo?: number;
  precoMaximo?: number;
  quilometragemMaxima?: number;
  ano?: number;
  cor?: string;
}

export interface AnunciosFiltro extends PaginacaoFiltro {
  plataformaId?: string;
  status?: string;
  lojaId?: string;
  veiculoId?: string;
}

export interface VendasFiltro extends PaginacaoFiltro {
  periodoInicio?: string;
  periodoFim?: string;
  lojaId?: string;
  vendedorId?: string;
  status?: string;
}

export interface PromocoesFiltro extends PaginacaoFiltro {
  lojaId?: string;
  campanhaId?: string;
  somenteAtivas?: boolean;
  tipoPromocao?: string;
}

export interface VitrineFiltro extends PaginacaoFiltro {
  lojaId?: string;
  status?: string;
}

export interface VitrineResumo {
  veiculoId: string;
  lojaId: string;
  titulo: string;
  preco: number;
  statusAnuncio: string;
  disponivel: boolean;
  imageUrl?: string;
}

export interface VitrineDisponivelResumo {
  veiculoId: string;
  titulo: string;
  preco: number;
  jaNaLoja: boolean;
}

export interface VitrineDetalhe extends VitrineResumo {
  descricao?: string;
  fotos: string[];
  promocaoAplicada?: string;
  ultimaAtualizacao: string;
}

export interface VitrineRelacionamento {
  lojaId: string;
  lojaNome: string;
  compartilhamentos: Array<{
    lojaId: string;
    lojaNome: string;
    ativo: boolean;
  }>;
  observacao?: string;
}
