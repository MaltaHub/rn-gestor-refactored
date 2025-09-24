import type {
  AnaliseComparativa,
  AnuncioAgrupado,
  AnuncioDetalhe,
  AnuncioResumo,
  AvisoPendencia,
  CadastroContexto,
  CadastroItem,
  EmpresaResumo,
  EmpresaVinculo,
  LojaDisponivel,
  LojaResumo,
  MarketingDifferential,
  MarketingHeroContent,
  ModeloDetalhe,
  PermissaoModulo,
  PipelineResumo,
  PromocaoResumo,
  PromocaoTabelaEntrada,
  VitrineDetalhe,
  VitrineDisponivelResumo,
  VitrineRelacionamento,
  VitrineResumo,
  UsuarioPerfil,
  UsuarioPreferencias,
  VehicleDetail,
  VehicleMediaItem,
  VehicleSummary,
  VendaDetalhe,
  VendaInsight,
  VendaResumo
} from "@/types/domain";

const agora = new Date().toISOString();

export const MOCK_EMPRESA: EmpresaResumo = {
  id: "emp-001",
  nome: "Grupo Horizonte Motors",
  dominio: "horizonte-motors.com",
  ativo: true
};

export const MOCK_LOJAS: LojaResumo[] = [
  { id: "loja-1", nome: "Horizonte Matriz", empresaId: MOCK_EMPRESA.id, cidade: "São Paulo", uf: "SP", ativa: true },
  { id: "loja-2", nome: "Horizonte Sul", empresaId: MOCK_EMPRESA.id, cidade: "Campinas", uf: "SP", ativa: true },
  { id: "loja-3", nome: "Horizonte Norte", empresaId: MOCK_EMPRESA.id, cidade: "São José dos Campos", uf: "SP", ativa: false }
];

export const MOCK_EMPRESA_VINCULO: EmpresaVinculo = {
  empresaId: MOCK_EMPRESA.id,
  empresaNome: MOCK_EMPRESA.nome,
  lojaPadraoId: MOCK_LOJAS[0]?.id ?? null,
  lojas: MOCK_LOJAS,
  perfilCompleto: true
};

export const MOCK_HERO: MarketingHeroContent = {
  title: "ERP automotivo para concessionárias multi-loja",
  subtitle: "Centralize estoque, anúncios e vendas em um cockpit único, pronto para crescer com a sua operação.",
  ctaLabel: "Entrar no console",
  imageUrl: "https://placehold.co/960x540?text=Gestor+Automotivo"
};

export const MOCK_DIFERENCIAIS: MarketingDifferential[] = [
  {
    id: "est",
    title: "Estoque único",
    description: "Compartilhe veículos entre lojas com regras claras de disponibilidade.",
    highlight: "Governança total"
  },
  {
    id: "an",
    title: "Anúncios unificados",
    description: "Publique e audite marketplaces com consistência e rastreabilidade."
  },
  {
    id: "vit",
    title: "Vitrine inteligente",
    description: "Monte vitrines por loja em segundos, com preços lastreados nas promoções."
  }
];

export const MOCK_PERMISSOES: PermissaoModulo[] = [
  { slug: "estoque", permitido: true },
  { slug: "anuncios", permitido: true },
  { slug: "vendas", permitido: true },
  { slug: "promocoes", permitido: true },
  { slug: "vitrine", permitido: true },
  { slug: "perfil", permitido: true },
  { slug: "configuracoes", permitido: true },
  { slug: "avisos", permitido: true }
];

export const MOCK_MODELOS_DETALHE: ModeloDetalhe[] = [
  {
    id: "mod-compass",
    marca: "Jeep",
    nome: "Compass",
    versao: "Limited T270",
    anoInicial: 2022,
    anoFinal: 2024,
    ativo: true
  },
  {
    id: "mod-corolla",
    marca: "Toyota",
    nome: "Corolla Cross",
    versao: "XRE",
    anoInicial: 2021,
    anoFinal: 2024,
    ativo: true
  },
  {
    id: "mod-nivus",
    marca: "Volkswagen",
    nome: "Nivus",
    versao: "Highline",
    anoInicial: 2020,
    anoFinal: 2024,
    ativo: true
  }
];

const fotosCompass: VehicleMediaItem[] = [
  { id: "foto-compass-1", path: "https://placehold.co/600x400?text=Compass+Frente", ordem: 1, eCapa: true, atualizadoEm: agora },
  { id: "foto-compass-2", path: "https://placehold.co/600x400?text=Compass+Interior", ordem: 2, eCapa: false, atualizadoEm: agora }
];

const fotosCompassSul: VehicleMediaItem[] = [
  { id: "foto-compass-3", path: "https://placehold.co/600x400?text=Compass+Detalhes", ordem: 1, eCapa: true, atualizadoEm: agora }
];

const fotosCorolla: VehicleMediaItem[] = [
  { id: "foto-corolla-1", path: "https://placehold.co/600x400?text=Corolla+Cross", ordem: 1, eCapa: true, atualizadoEm: agora },
  { id: "foto-corolla-2", path: "https://placehold.co/600x400?text=Corolla+Painel", ordem: 2, eCapa: false, atualizadoEm: agora }
];

const fotosNivus: VehicleMediaItem[] = [
  { id: "foto-nivus-1", path: "https://placehold.co/600x400?text=Nivus+Highline", ordem: 1, eCapa: true, atualizadoEm: agora },
  { id: "foto-nivus-2", path: "https://placehold.co/600x400?text=Nivus+Traseira", ordem: 2, eCapa: false, atualizadoEm: agora }
];

function buildDocumentacao(veiculoId: string, lojaId: string, status: string): Required<VehicleDetail>["documentacao"] {
  return {
    tem_multas: false,
    observacoes_multas: null,
    observacoes_gerais: null,
    aprovada_vistoria: true,
    data_vistoria: agora,
    vistoria_realizada: true,
    responsavel_id: "usr-001",
    data_entrada: agora,
    data_conclusao: agora,
    criado_em: agora,
    atualizado_em: agora,
    observacoes_restricoes: null,
    data_transferencia: null,
    transferencia_concluida: false,
    transferencia_iniciada: false,
    tem_restricoes: false,
    tem_embargos: false,
    tem_precatorios: false,
    valor_dividas_ativas: 0,
    tem_dividas_ativas: false,
    valor_multas: 0,
    tem_manual: true,
    tem_chave_reserva: true,
    tem_nf_compra: true,
    tem_crv: true,
    tem_crlv: true,
    status_geral: status,
    loja_id: lojaId,
    veiculo_id: veiculoId,
    empresa_id: MOCK_EMPRESA.id,
    id: `doc-${veiculoId}`
  };
}

export const MOCK_VEHICLES_DETAIL: VehicleDetail[] = [
  {
    id: "veh-001",
    empresaId: MOCK_EMPRESA.id,
    placa: "BRA2E19",
    cor: "Branco Polar",
    estadoVenda: "disponivel",
    hodometro: 12500,
    anoModelo: 2023,
    anoFabricacao: 2023,
    precoVenal: 184900,
    modeloId: "mod-compass",
    modeloNome: "Compass",
    modeloMarca: "Jeep",
    lojaId: "loja-1",
    lojaNome: "Horizonte Matriz",
    precoAnuncio: 184900,
    anuncioStatus: "publicado",
    anuncioTitulo: "Jeep Compass Limited T270 2023",
    anuncioAtualizadoEm: agora,
    estadoVeiculo: "seminovo",
    estagioDocumentacao: "regular",
    observacao: "SUV médio topo de linha, com pacote tecnológico completo e revisões em dia.",
    documentacao: buildDocumentacao("veh-001", "loja-1", "regular"),
    midiaPorLoja: [
      { lojaId: "loja-1", lojaNome: "Horizonte Matriz", fotos: fotosCompass, capaId: fotosCompass[0].id },
      { lojaId: "loja-2", lojaNome: "Horizonte Sul", fotos: fotosCompassSul, capaId: fotosCompassSul[0].id }
    ]
  },
  {
    id: "veh-002",
    empresaId: MOCK_EMPRESA.id,
    placa: "XYZ1A23",
    cor: "Prata Supernova",
    estadoVenda: "reservado",
    hodometro: 18700,
    anoModelo: 2023,
    anoFabricacao: 2022,
    precoVenal: 172500,
    modeloId: "mod-corolla",
    modeloNome: "Corolla Cross",
    modeloMarca: "Toyota",
    lojaId: "loja-2",
    lojaNome: "Horizonte Sul",
    precoAnuncio: 172500,
    anuncioStatus: "pendente",
    anuncioTitulo: "Toyota Corolla Cross XRE 2022",
    anuncioAtualizadoEm: agora,
    estadoVeiculo: "seminovo",
    estagioDocumentacao: "analise",
    observacao: "SUV híbrido com ótimo consumo, revisões e garantia de fábrica.",
    documentacao: buildDocumentacao("veh-002", "loja-2", "pendente"),
    midiaPorLoja: [
      { lojaId: "loja-2", lojaNome: "Horizonte Sul", fotos: fotosCorolla, capaId: fotosCorolla[0].id }
    ]
  },
  {
    id: "veh-003",
    empresaId: MOCK_EMPRESA.id,
    placa: "QWE9Z87",
    cor: "Azul Biscay",
    estadoVenda: "disponivel",
    hodometro: 28400,
    anoModelo: 2022,
    anoFabricacao: 2021,
    precoVenal: 134900,
    modeloId: "mod-nivus",
    modeloNome: "Nivus",
    modeloMarca: "Volkswagen",
    lojaId: "loja-1",
    lojaNome: "Horizonte Matriz",
    precoAnuncio: 134900,
    anuncioStatus: "publicado",
    anuncioTitulo: "VW Nivus Highline 2021",
    anuncioAtualizadoEm: agora,
    estadoVeiculo: "seminovo",
    estagioDocumentacao: "regular",
    observacao: "SUV cupê com pacote tecnológico completo e conectividade VW Play.",
    documentacao: buildDocumentacao("veh-003", "loja-1", "regular"),
    midiaPorLoja: [
      { lojaId: "loja-1", lojaNome: "Horizonte Matriz", fotos: fotosNivus, capaId: fotosNivus[0].id }
    ]
  }
];

export const MOCK_VEHICLES_SUMMARY: VehicleSummary[] = MOCK_VEHICLES_DETAIL.map(
  ({ documentacao, midiaPorLoja, estadoVeiculo, estagioDocumentacao, observacao, ...rest }) => ({ ...rest })
);

export const MOCK_ANUNCIOS: AnuncioDetalhe[] = [
  {
    id: "an-001",
    veiculoId: "veh-001",
    plataformaId: "plat-webmotors",
    lojaId: "loja-1",
    titulo: "Jeep Compass Limited T270 2023",
    status: "publicado",
    preco: 184900,
    atualizadoEm: agora,
    tipo: "veiculo",
    descricao: "Compass completo com pacote Safety e Premium",
    descricaoOriginal: "Compass Limited 2023",
    tituloOriginal: "Jeep Compass Limited",
    link: "https://webmotors.example/compass",
    tipoIdentificador: "placa",
    identificador: "BRA2E19",
    publicadoEm: agora,
    expiraEm: null,
    metricas: { visualizacoes: 1240, favoritos: 45, mensagens: 12 }
  },
  {
    id: "an-002",
    veiculoId: "veh-001",
    plataformaId: "plat-icarros",
    lojaId: "loja-1",
    titulo: "Jeep Compass Limited T270 2023",
    status: "pendente",
    preco: 186500,
    atualizadoEm: agora,
    tipo: "veiculo",
    descricao: "Versão Limited com teto e pacote tecnológico",
    link: "https://icarros.example/compass",
    tipoIdentificador: "placa",
    identificador: "BRA2E19",
    publicadoEm: null,
    expiraEm: null,
    metricas: { visualizacoes: 312, favoritos: 12, mensagens: 4 }
  },
  {
    id: "an-003",
    veiculoId: "veh-002",
    plataformaId: "plat-webmotors",
    lojaId: "loja-2",
    titulo: "Toyota Corolla Cross XRE 2022",
    status: "pendente",
    preco: 172500,
    atualizadoEm: agora,
    tipo: "veiculo",
    descricao: "Corolla Cross híbrido com pacote Safety Sense",
    link: "https://webmotors.example/corolla-cross",
    tipoIdentificador: "placa",
    identificador: "XYZ1A23",
    publicadoEm: null,
    expiraEm: null,
    metricas: { visualizacoes: 540, favoritos: 28, mensagens: 9 }
  }
];

export const MOCK_ANUNCIOS_AGRUPADOS: AnuncioAgrupado[] = [
  {
    plataformaId: "plat-webmotors",
    plataformaNome: "Webmotors",
    lojaId: "loja-1",
    veiculos: MOCK_ANUNCIOS.filter((anuncio) => anuncio.plataformaId === "plat-webmotors" && anuncio.lojaId === "loja-1").map(({ descricao, descricaoOriginal, tituloOriginal, link, tipoIdentificador, identificador, publicadoEm, expiraEm, metricas, ...rest }) => rest)
  },
  {
    plataformaId: "plat-icarros",
    plataformaNome: "iCarros",
    lojaId: "loja-1",
    veiculos: MOCK_ANUNCIOS.filter((anuncio) => anuncio.plataformaId === "plat-icarros").map(({ descricao, descricaoOriginal, tituloOriginal, link, tipoIdentificador, identificador, publicadoEm, expiraEm, metricas, ...rest }) => rest)
  }
];

export const MOCK_PROMOCOES: PromocaoResumo[] = [
  {
    id: "promo-001",
    veiculoLojaId: "vl-veh-001-loja-1",
    anuncioId: "an-001",
    precoPromocional: 179900,
    dataInicio: agora,
    dataFim: null,
    tipoPromocao: "ajuste_preco",
    ativo: true,
    lojaId: "loja-1",
    veiculoId: "veh-001"
  },
  {
    id: "promo-002",
    veiculoLojaId: "vl-veh-002-loja-2",
    anuncioId: "an-003",
    precoPromocional: 169900,
    dataInicio: agora,
    dataFim: null,
    tipoPromocao: "feirao",
    ativo: true,
    lojaId: "loja-2",
    veiculoId: "veh-002"
  }
];

export const MOCK_PROMOCOES_TABELA: PromocaoTabelaEntrada[] = MOCK_PROMOCOES.map(({ lojaId, veiculoId, ...rest }) => rest);

function getCapaPorLoja(veiculoId: string, lojaId?: string | null) {
  const detail = MOCK_VEHICLES_DETAIL.find((item) => item.id === veiculoId);
  if (!detail) return undefined;
  const midia = detail.midiaPorLoja.find((item) => (lojaId ? item.lojaId === lojaId : true)) ?? detail.midiaPorLoja[0];
  return midia?.fotos[0]?.path;
}

export const MOCK_VITRINE_RESUMO: VitrineResumo[] = [
  {
    veiculoId: "veh-001",
    lojaId: "loja-1",
    titulo: "Jeep Compass Limited T270 2023",
    preco: 184900,
    statusAnuncio: "publicado",
    disponivel: true,
    imageUrl: getCapaPorLoja("veh-001", "loja-1")
  },
  {
    veiculoId: "veh-001",
    lojaId: "loja-2",
    titulo: "Jeep Compass Limited T270 2023",
    preco: 186500,
    statusAnuncio: "pendente",
    disponivel: true,
    imageUrl: getCapaPorLoja("veh-001", "loja-2")
  },
  {
    veiculoId: "veh-002",
    lojaId: "loja-2",
    titulo: "Toyota Corolla Cross XRE 2022",
    preco: 172500,
    statusAnuncio: "pendente",
    disponivel: true,
    imageUrl: getCapaPorLoja("veh-002", "loja-2")
  }
];

export const MOCK_VITRINE_DISPONIVEIS: VitrineDisponivelResumo[] = MOCK_VEHICLES_SUMMARY.map((veiculo) => ({
  veiculoId: veiculo.id,
  titulo: veiculo.anuncioTitulo ?? `${veiculo.modeloMarca ?? ""} ${veiculo.modeloNome ?? ""}`.trim(),
  preco: veiculo.precoAnuncio ?? veiculo.precoVenal ?? 0,
  jaNaLoja: MOCK_VITRINE_RESUMO.some((entrada) => entrada.veiculoId === veiculo.id)
}));

export const MOCK_VITRINE_DETALHES: VitrineDetalhe[] = MOCK_VITRINE_RESUMO.map((resumo) => ({
  ...resumo,
  descricao: `Vitrine destacando o veículo ${resumo.titulo} para a loja ${resumo.lojaId}.`,
  fotos:
    MOCK_VEHICLES_DETAIL.find((veiculo) => veiculo.id === resumo.veiculoId)?.midiaPorLoja.find(
      (midia) => midia.lojaId === resumo.lojaId
    )?.fotos.map((foto) => foto.path) ?? [],
  promocaoAplicada: MOCK_PROMOCOES.find((promo) => promo.veiculoId === resumo.veiculoId)?.id,
  ultimaAtualizacao: agora
}));

export const MOCK_VITRINE_RELACIONAMENTOS: VitrineRelacionamento[] = MOCK_LOJAS.map((loja) => ({
  lojaId: loja.id,
  lojaNome: loja.nome,
  compartilhamentos: MOCK_LOJAS.filter((rel) => rel.id !== loja.id).map((rel) => ({
    lojaId: rel.id,
    lojaNome: rel.nome,
    ativo: Boolean(rel.ativa)
  })),
  observacao: "Vitrine sincronizada com estoque único"
}));

export const MOCK_VENDAS: VendaDetalhe[] = [
  {
    id: "ven-001",
    veiculoId: "veh-003",
    lojaId: "loja-1",
    precoVenda: 129900,
    status: "concluida",
    dataVenda: agora,
    clienteNome: "Marcos Azevedo",
    atualizadoEm: agora,
    formaPagamento: "financiamento",
    valorEntrada: 29900,
    valorFinanciado: 100000,
    numeroParcelas: 36,
    valorParcela: 3250,
    temSeguro: true,
    seguradora: "Porto Seguro",
    valorSeguro: 2800,
    instituicaoFinanceira: "Banco Horizonte",
    comissaoLoja: 3500,
    comissaoVendedor: 1800,
    observacoes: "Cliente fidelidade com bônus de troca",
    clienteContato: {
      documento: "123.456.789-00",
      telefone: "11 98888-7766",
      email: "marcos@example.com",
      endereco: "Rua das Flores, 120"
    },
    datas: {
      previsaoEntrega: agora,
      entrega: agora,
      criadoEm: agora
    }
  },
  {
    id: "ven-002",
    veiculoId: "veh-002",
    lojaId: "loja-2",
    precoVenda: 168000,
    status: "negociacao",
    dataVenda: agora,
    clienteNome: "Ana Souza",
    atualizadoEm: agora,
    formaPagamento: "vista",
    valorEntrada: 168000,
    valorFinanciado: 0,
    numeroParcelas: 0,
    valorParcela: 0,
    temSeguro: false,
    seguradora: null,
    valorSeguro: null,
    instituicaoFinanceira: null,
    comissaoLoja: 2800,
    comissaoVendedor: 1400,
    observacoes: "Cliente solicitou blindagem",
    clienteContato: {
      documento: "321.654.987-00",
      telefone: "19 97777-1234",
      email: "ana@example.com",
      endereco: "Av. Brasil, 400"
    },
    datas: {
      previsaoEntrega: null,
      entrega: null,
      criadoEm: agora
    }
  }
];

export const MOCK_VENDAS_RESUMO: VendaResumo[] = MOCK_VENDAS.map(
  ({ formaPagamento, valorEntrada, valorFinanciado, numeroParcelas, valorParcela, temSeguro, seguradora, valorSeguro, instituicaoFinanceira, comissaoLoja, comissaoVendedor, observacoes, clienteContato, datas, ...rest }) => rest
);

export const MOCK_VENDA_INSIGHT: VendaInsight = {
  totalVendas: MOCK_VENDAS_RESUMO.length,
  ticketMedio: Math.round(MOCK_VENDAS_RESUMO.reduce((acc, venda) => acc + venda.precoVenda, 0) / MOCK_VENDAS_RESUMO.length),
  desempenhoPorLoja: MOCK_VENDAS_RESUMO.reduce<Record<string, number>>((acc, venda) => {
    acc[venda.lojaId] = (acc[venda.lojaId] ?? 0) + 1;
    return acc;
  }, {}),
  periodo: {
    inicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    fim: agora
  }
};

export const MOCK_PIPELINE_RESUMO: PipelineResumo[] = [
  { etapa: "Prospecção", quantidade: 12 },
  { etapa: "Negociação", quantidade: 6 },
  { etapa: "Contrato", quantidade: 3 },
  { etapa: "Concluídas", quantidade: 9 }
];

export const MOCK_ANALISE_OPERACIONAL: AnaliseComparativa[] = [
  { label: "Conversão", valor: 68, variacao: 5 },
  { label: "Tempo médio de estoque", valor: 32, variacao: -2 },
  { label: "Ticket médio", valor: 158200, variacao: 4 }
];

export const MOCK_AVISOS: AvisoPendencia[] = [
  {
    id: "aviso-001",
    tipo: "sem_foto",
    veiculoId: "veh-002",
    lojaId: "loja-2",
    descricao: "Adicionar fotos detalhadas do Corolla Cross",
    criadoEm: agora
  },
  {
    id: "aviso-002",
    tipo: "anuncio_desatualizado",
    veiculoId: "veh-003",
    lojaId: "loja-1",
    descricao: "Atualizar preço do Nivus na Webmotors",
    criadoEm: agora
  }
];

export const MOCK_CADASTRO_CONTEXTOS: CadastroContexto[] = [
  { tipo: "stores", label: "Lojas" },
  { tipo: "models", label: "Modelos" },
  { tipo: "platforms", label: "Plataformas" },
  { tipo: "characteristics", label: "Características" },
  { tipo: "locations", label: "Locais" }
];

export const MOCK_CADASTROS: Record<CadastroContexto["tipo"], CadastroItem[]> = {
  stores: MOCK_LOJAS.map(({ id, nome, ativa }) => ({ id, nome, descricao: nome, ativo: Boolean(ativa) })),
  models: MOCK_MODELOS_DETALHE.map(({ id, nome, marca, ativo }) => ({ id, nome: `${marca} ${nome}`, descricao: marca, ativo })),
  platforms: [
    { id: "plat-webmotors", nome: "Webmotors", descricao: "Marketplace Webmotors", ativo: true },
    { id: "plat-icarros", nome: "iCarros", descricao: "Marketplace iCarros", ativo: true }
  ],
  characteristics: [
    { id: "caracteristica-1", nome: "Bancos em couro", ativo: true },
    { id: "caracteristica-2", nome: "Piloto automático", ativo: true }
  ],
  locations: [
    { id: "loc-1", nome: "Pátio principal", descricao: "Área externa", ativo: true }
  ]
};

export const MOCK_LOJAS_DISPONIVEIS: LojaDisponivel[] = MOCK_LOJAS.map(({ id, nome, cidade, uf, empresaId }) => ({
  id,
  nome,
  cidade,
  uf,
  empresaId
}));

export const MOCK_USUARIO: UsuarioPerfil = {
  id: "usr-001",
  nome: "Renata Almeida",
  email: "renata.almeida@horizonte-motors.com",
  telefone: "+55 11 98888-1122",
  cargo: "Gerente de Operações"
};

export const MOCK_PREFERENCIAS: UsuarioPreferencias = {
  darkMode: true,
  notificacoesEmail: true,
  notificacoesSms: false,
  resumoSemanal: true
};
