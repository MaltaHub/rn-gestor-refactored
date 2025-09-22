export interface InventoryVehicle {
  id: string;
  placa: string;
  modelo_nome: string;
  estado_venda: "disponivel" | "reservado" | "em_preparacao" | "vendido" | string;
  preco_venal: number | null;
  loja_id: string | null;
  loja_nome: string | null;
  atualizado_em: string;
}

export const inventoryVehicles: InventoryVehicle[] = [
  {
    id: "veh-1",
    placa: "ABC2D34",
    modelo_nome: "Compass Longitude 2.0",
    estado_venda: "disponivel",
    preco_venal: 142900,
    loja_id: "store-1",
    loja_nome: "Loja Centro",
    atualizado_em: "2024-02-05T10:30:00Z"
  },
  {
    id: "veh-2",
    placa: "XYZ1H22",
    modelo_nome: "Civic Touring",
    estado_venda: "reservado",
    preco_venal: 158500,
    loja_id: "store-2",
    loja_nome: "Loja Zona Sul",
    atualizado_em: "2024-02-03T18:45:00Z"
  },
  {
    id: "veh-3",
    placa: "KLM5P90",
    modelo_nome: "HR-V EXL",
    estado_venda: "em_preparacao",
    preco_venal: 139000,
    loja_id: "store-1",
    loja_nome: "Loja Centro",
    atualizado_em: "2024-02-01T22:13:00Z"
  }
];

export interface MarketplaceSummary {
  plataforma_id: string;
  plataforma_nome: string;
  status_operacao: "sincronizado" | "pendente" | "erro" | string;
  anuncios_publicados: number;
  ultima_sincronizacao: string;
}

export const marketplaceSummaries: MarketplaceSummary[] = [
  {
    plataforma_id: "plat-1",
    plataforma_nome: "Webmotors",
    status_operacao: "sincronizado",
    anuncios_publicados: 24,
    ultima_sincronizacao: "2024-02-04T10:10:00Z"
  },
  {
    plataforma_id: "plat-2",
    plataforma_nome: "OLX Motors",
    status_operacao: "pendente",
    anuncios_publicados: 17,
    ultima_sincronizacao: "2024-02-03T18:45:00Z"
  },
  {
    plataforma_id: "plat-3",
    plataforma_nome: "iCarros",
    status_operacao: "erro",
    anuncios_publicados: 11,
    ultima_sincronizacao: "2024-02-02T22:13:00Z"
  }
];

export interface SaleRecord {
  id: string;
  cliente_nome: string;
  veiculo_id: string;
  veiculo_modelo: string;
  preco_venda: number;
  status_venda: "negociacao" | "proposta" | "contrato" | "concluida" | string;
  atualizado_em: string;
}

export const salesRecords: SaleRecord[] = [
  {
    id: "sale-1",
    cliente_nome: "Maria Oliveira",
    veiculo_id: "veh-1",
    veiculo_modelo: "Compass Longitude",
    preco_venda: 146900,
    status_venda: "proposta",
    atualizado_em: "2024-02-04T14:10:00Z"
  },
  {
    id: "sale-2",
    cliente_nome: "João Costa",
    veiculo_id: "veh-2",
    veiculo_modelo: "Civic Touring",
    preco_venda: 158500,
    status_venda: "contrato",
    atualizado_em: "2024-02-03T16:25:00Z"
  },
  {
    id: "sale-3",
    cliente_nome: "Ana Souza",
    veiculo_id: "veh-3",
    veiculo_modelo: "Tracker Premier",
    preco_venda: 134800,
    status_venda: "negociacao",
    atualizado_em: "2024-02-02T11:32:00Z"
  }
];

export interface PipelineSnapshotItem {
  status_venda: string;
  quantidade: number;
  tempo_medio_dias: number;
}

export const pipelineSnapshot: PipelineSnapshotItem[] = [
  { status_venda: "negociacao", quantidade: 8, tempo_medio_dias: 3 },
  { status_venda: "proposta", quantidade: 5, tempo_medio_dias: 5 },
  { status_venda: "contrato", quantidade: 2, tempo_medio_dias: 2 }
];

export interface PromotionRecord {
  id: string;
  tipo_promocao: string;
  preco_promocional: number;
  data_inicio: string;
  data_fim: string | null;
  ativo: boolean;
  autor_id: string;
}

export const promotionRecords: PromotionRecord[] = [
  {
    id: "promo-1",
    tipo_promocao: "bonus",
    preco_promocional: 3000,
    data_inicio: "2024-02-01T00:00:00Z",
    data_fim: "2024-02-10T23:59:59Z",
    ativo: true,
    autor_id: "user-1"
  },
  {
    id: "promo-2",
    tipo_promocao: "taxa-zero",
    preco_promocional: 0,
    data_inicio: "2024-02-05T00:00:00Z",
    data_fim: "2024-02-20T23:59:59Z",
    ativo: false,
    autor_id: "user-1"
  }
];

export interface DashboardMetric {
  id: string;
  titulo: string;
  valor: number;
  unidade?: string;
}

export const dashboardMetrics: DashboardMetric[] = [
  { id: "estoque-total", titulo: "Veículos em estoque", valor: 18 },
  { id: "anuncios-ativos", titulo: "Anúncios ativos", valor: 12 },
  { id: "vendas-mes", titulo: "Vendas no mês", valor: 6 },
  { id: "promocoes-vigentes", titulo: "Promoções vigentes", valor: 3 }
];

export interface DashboardChecklistItem {
  id: string;
  titulo: string;
  descricao: string;
}

export const dashboardChecklist: DashboardChecklistItem[] = [
  {
    id: "docs",
    titulo: "Documentação pendente",
    descricao: "Valide CRLV e laudos antes de liberar a venda."
  },
  {
    id: "marketing",
    titulo: "Revisar campanhas",
    descricao: "Confirme valores e datas com marketing."
  },
  {
    id: "metas",
    titulo: "Acompanhar metas",
    descricao: "Compare volume vendido com a meta semanal."
  }
];

export interface ProfileRecord {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  bio: string;
}

export const profileRecord: ProfileRecord = {
  id: "user-1",
  nome: "Ana Ribeiro",
  email: "ana.ribeiro@gestor.com",
  telefone: "+55 11 99999-0000",
  cargo: "Gestora de operações",
  bio: "Conduz iniciativas de modernização e mantém os indicadores da operação sob controle."
};

export interface PreferenceRecord {
  usuario_id: string;
  notificacoes: boolean;
  resumo_semanal: boolean;
  compartilhar_dados: boolean;
}

export const preferenceRecord: PreferenceRecord = {
  usuario_id: "user-1",
  notificacoes: true,
  resumo_semanal: true,
  compartilhar_dados: false
};

export interface OperationSetting {
  empresa_id: string;
  nome_fantasia: string;
  cor_principal: string;
  timezone: string;
}

export const operationSetting: OperationSetting = {
  empresa_id: "company-1",
  nome_fantasia: "Garagem Horizonte",
  cor_principal: "#38bdf8",
  timezone: "America/Sao_Paulo"
};

export interface FeatureFlagsRecord {
  empresa_id: string;
  alertas_email: boolean;
  metricas_avancadas: boolean;
  modo_auditoria: boolean;
  aprovacao_dupla: boolean;
}

export const featureFlagsRecord: FeatureFlagsRecord = {
  empresa_id: "company-1",
  alertas_email: true,
  metricas_avancadas: true,
  modo_auditoria: false,
  aprovacao_dupla: false
};

export interface StoreRecord {
  id: string;
  empresa_id: string;
  nome: string;
}

export const storeRecords: StoreRecord[] = [
  { id: "store-1", empresa_id: "company-1", nome: "Loja Centro" },
  { id: "store-2", empresa_id: "company-1", nome: "Loja Zona Sul" },
  { id: "store-3", empresa_id: "company-1", nome: "Loja Marginal" }
];

export interface CharacteristicRecord {
  id: string;
  empresa_id: string;
  nome: string;
}

export const characteristicRecords: CharacteristicRecord[] = [
  { id: "char-1", empresa_id: "company-1", nome: "Baixa quilometragem" },
  { id: "char-2", empresa_id: "company-1", nome: "Revisão em dia" },
  { id: "char-3", empresa_id: "company-1", nome: "Garantia de fábrica" }
];

export interface PlatformRecord {
  id: string;
  empresa_id: string;
  nome: string;
}

export const platformRecords: PlatformRecord[] = [
  { id: "plat-1", empresa_id: "company-1", nome: "Webmotors" },
  { id: "plat-2", empresa_id: "company-1", nome: "OLX Motors" },
  { id: "plat-3", empresa_id: "company-1", nome: "iCarros" }
];

export interface LocationRecord {
  id: string;
  empresa_id: string;
  nome: string;
}

export const locationRecords: LocationRecord[] = [
  { id: "loc-1", empresa_id: "company-1", nome: "Patio principal" },
  { id: "loc-2", empresa_id: "company-1", nome: "Showroom" },
  { id: "loc-3", empresa_id: "company-1", nome: "Estoque externo" }
];

export interface ModelRecord {
  id: string;
  empresa_id: string;
  marca: string;
  nome: string;
  edicao?: string | null;
  carroceria?: string | null;
  combustivel?: string | null;
  tipo_cambio?: string | null;
  ano_inicial?: number | null;
  ano_final?: number | null;
}

export const modelRecords: ModelRecord[] = [
  {
    id: "model-1",
    empresa_id: "company-1",
    marca: "Jeep",
    nome: "Compass",
    edicao: "Longitude 2.0",
    carroceria: "suv",
    combustivel: "flex",
    tipo_cambio: "automatico",
    ano_inicial: 2022,
    ano_final: 2024
  },
  {
    id: "model-2",
    empresa_id: "company-1",
    marca: "Honda",
    nome: "Civic",
    edicao: "Touring",
    carroceria: "sedan",
    combustivel: "gasolina",
    tipo_cambio: "automatico",
    ano_inicial: 2021,
    ano_final: 2024
  },
  {
    id: "model-3",
    empresa_id: "company-1",
    marca: "Chevrolet",
    nome: "Tracker",
    edicao: "Premier",
    carroceria: "suv",
    combustivel: "flex",
    tipo_cambio: "automatico",
    ano_inicial: 2020,
    ano_final: 2023
  }
];
