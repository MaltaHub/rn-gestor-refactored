import type {
  AnaliseComparativa,
  AnuncioAgrupado,
  AnuncioDetalhe,
  AnunciosFiltro,
  AnuncioResumo,
  AvisoPendencia,
  CadastroContexto,
  CadastroItem,
  ConcessionariaContexto,
  ConviteValidacao,
  DashboardMetrics,
  EmpresaVinculo,
  EstoqueFiltro,
  LojaDisponivel,
  MarketingDifferential,
  MarketingHeroContent,
  ModeloDetalhe,
  PermissaoModulo,
  PipelineResumo,
  PromocoesFiltro,
  PromocaoResumo,
  PromocaoTabelaEntrada,
  VitrineDetalhe,
  VitrineDisponivelResumo,
  VitrineFiltro,
  VitrineRelacionamento,
  VitrineResumo,
  UsuarioPerfil,
  UsuarioPreferencias,
  VehicleDetail,
  VehicleListResponse,
  VehicleSummary,
  VendaDetalhe,
  VendaInsight,
  VendaResumo,
  VendasFiltro
} from "@/types/domain";

export interface OperationMetadata {
  domain: string;
  description: string;
  requiresLoja: boolean;
}

interface ReadOperationSpec<Params, Result> {
  params: Params;
  result: Result;
}

export interface ReadOperationMap {
  "marketing.hero": ReadOperationSpec<void, MarketingHeroContent | null>;
  "marketing.diferenciais": ReadOperationSpec<void, MarketingDifferential[]>;
  ".empresa_do_usuario": ReadOperationSpec<void, EmpresaVinculo | null>;
  "convites.validarToken": ReadOperationSpec<{ token: string }, ConviteValidacao>;
  "contexto.concessionaria": ReadOperationSpec<void, ConcessionariaContexto>;
  "permissoes.modulos": ReadOperationSpec<void, PermissaoModulo[]>;
  "dashboard.metricas": ReadOperationSpec<void, DashboardMetrics>;
  "estoque.recentes": ReadOperationSpec<{ limite?: number }, VehicleSummary[]>;
  "estoque.buscar": ReadOperationSpec<EstoqueFiltro, VehicleListResponse>;
  "estoque.listar": ReadOperationSpec<EstoqueFiltro, VehicleListResponse>;
  "estoque.detalhes": ReadOperationSpec<{ id: string }, VehicleDetail | null>;
  "anuncios.listarPorPlataforma": ReadOperationSpec<AnunciosFiltro, AnuncioAgrupado[]>;
  "anuncios.listar": ReadOperationSpec<AnunciosFiltro, AnuncioResumo[]>;
  "anuncios.detalhes": ReadOperationSpec<{ vehicleId: string; platformId: string }, AnuncioDetalhe | null>;
  "vitrine.listar": ReadOperationSpec<VitrineFiltro, VitrineResumo[]>;
  "vitrine.disponiveis": ReadOperationSpec<VitrineFiltro, VitrineDisponivelResumo[]>;
  "vitrine.resumo": ReadOperationSpec<{ veiculoId: string }, VitrineResumo | null>;
  "vitrine.detalhes": ReadOperationSpec<{ veiculoId: string }, VitrineDetalhe | null>;
  "vitrine.relacionamentos": ReadOperationSpec<{ lojaId?: string }, VitrineRelacionamento[]>;
  "vendas.insights": ReadOperationSpec<VendasFiltro, VendaInsight>;
  "vendas.recentes": ReadOperationSpec<VendasFiltro, VendaResumo[]>;
  "vendas.pipeline": ReadOperationSpec<VendasFiltro, PipelineResumo[]>;
  "vendas.analisesComparativas": ReadOperationSpec<VendasFiltro, AnaliseComparativa[]>;
  "vendas.detalhes": ReadOperationSpec<{ id: string }, VendaDetalhe | null>;
  "promocoes.tabelaPrecos": ReadOperationSpec<PromocoesFiltro, PromocaoTabelaEntrada[]>;
  "promocoes.campanhas": ReadOperationSpec<PromocoesFiltro, PromocaoResumo[]>;
  "usuarios.lojasDisponiveis": ReadOperationSpec<void, LojaDisponivel[]>;
  "usuarios.perfil": ReadOperationSpec<void, UsuarioPerfil>;
  "usuarios.preferencias": ReadOperationSpec<void, UsuarioPreferencias>;
  "cadastros.contextos": ReadOperationSpec<void, CadastroContexto[]>;
  "cadastros.listar": ReadOperationSpec<{ tipo: CadastroContexto["tipo"] }, CadastroItem[]>;
  "modelos.detalhes": ReadOperationSpec<{ id: string }, ModeloDetalhe | null>;
  "avisos.pendencias": ReadOperationSpec<void, AvisoPendencia[]>;
}

export type ReadResource = keyof ReadOperationMap;
export type ReadParams<Resource extends ReadResource> = ReadOperationMap[Resource]["params"];
export type ReadResult<Resource extends ReadResource> = ReadOperationMap[Resource]["result"];

interface WriteOperationSpec<Payload, Result> {
  payload: Payload;
  result: Result;
}

export interface WriteOperationMap {
  "auth.login": WriteOperationSpec<{ email: string; password: string }, { token: string; usuarioId: string; expiracao: string }>;
  "empresas.criar": WriteOperationSpec<{ nome: string; documento?: string; emailContato?: string }, EmpresaVinculo>;
  "convites.aceitar": WriteOperationSpec<{ token: string }, { sucesso: boolean; empresa?: EmpresaVinculo }>;
  "usuarios.definirLojaAtual": WriteOperationSpec<{ lojaId: string }, { lojaId: string }>;
  "estoque.criar": WriteOperationSpec<{ dados: Partial<VehicleDetail> }, { veiculoId: string }>;
  "estoque.importarLote": WriteOperationSpec<{ arquivoId: string }, { protocolo: string }>;
  "estoque.duplicar": WriteOperationSpec<{ idVeiculo: string }, { novoVeiculoId: string }>;
  "estoque.arquivar": WriteOperationSpec<{ idVeiculo: string }, { arquivado: boolean }>;
  "estoque.atualizar": WriteOperationSpec<{ idVeiculo: string; dados: Partial<VehicleDetail> }, { atualizado: boolean }>;
  "estoque.gerenciarMidia": WriteOperationSpec<{ idVeiculo: string; fotos: string[]; lojaId: string }, { salvo: boolean }>;
  "anuncios.publicar": WriteOperationSpec<{ veiculoId: string; plataformaId: string; lojaId: string }, { publicado: boolean }>;
  "anuncios.atualizar": WriteOperationSpec<{ veiculoId: string; plataformaId: string; lojaId: string; dados: Partial<AnuncioDetalhe> }, { atualizado: boolean }>;
  "anuncios.remover": WriteOperationSpec<{ veiculoId: string; plataformaId: string; lojaId: string }, { removido: boolean }>;
  "anuncios.syncLote": WriteOperationSpec<{ arquivoId: string; lojaId: string }, { protocolo: string }>;
  "vitrine.removerVeiculo": WriteOperationSpec<{ veiculoId: string; lojaId: string }, { removido: boolean }>;
  "vitrine.adicionarVeiculo": WriteOperationSpec<{ veiculoId: string; lojaId: string }, { adicionado: boolean }>;
  "vendas.registrar": WriteOperationSpec<{ dados: Partial<VendaDetalhe>; lojaId: string }, { vendaId: string }>;
  "vendas.atualizar": WriteOperationSpec<{ id: string; dados: Partial<VendaDetalhe>; lojaId: string }, { atualizado: boolean }>;
  "promocoes.aplicarAjuste": WriteOperationSpec<{ veiculoId: string; lojaId: string; precoPromocional: number }, { aplicado: boolean }>;
  "promocoes.atualizar": WriteOperationSpec<{ promocaoId: string; lojaId: string; dados: Partial<PromocaoTabelaEntrada> }, { atualizado: boolean }>;
  "promocoes.reverter": WriteOperationSpec<{ veiculoId: string; lojaId: string }, { revertido: boolean }>;
  "usuarios.atualizarPerfil": WriteOperationSpec<{ dados: Partial<UsuarioPerfil> }, { atualizado: boolean }>;
  "usuarios.atualizarCampos": WriteOperationSpec<{ dados: Partial<UsuarioPerfil> }, { atualizado: boolean }>;
  "usuarios.atualizarPreferencias": WriteOperationSpec<{ preferencias: Partial<UsuarioPreferencias> }, { atualizado: boolean }>;
  "usuarios.alterarSenha": WriteOperationSpec<{ senhaAtual: string; novaSenha: string }, { atualizado: boolean }>;
  "usuarios.ativarMFA": WriteOperationSpec<{ metodo: "sms" | "app" }, { ativado: boolean }>;
  "cadastros.salvar": WriteOperationSpec<{ tipo: CadastroContexto["tipo"]; item: Partial<CadastroItem> }, { id: string }>;
  "cadastros.excluir": WriteOperationSpec<{ tipo: CadastroContexto["tipo"]; id: string }, { removido: boolean }>;
  "modelos.criar": WriteOperationSpec<{ dados: Partial<ModeloDetalhe> }, { id: string }>;
  "modelos.atualizar": WriteOperationSpec<{ id: string; dados: Partial<ModeloDetalhe> }, { atualizado: boolean }>;
  "modelos.remover": WriteOperationSpec<{ id: string }, { removido: boolean }>;
}

export type WriteResource = keyof WriteOperationMap;
export type WritePayload<Resource extends WriteResource> = WriteOperationMap[Resource]["payload"];
export type WriteResult<Resource extends WriteResource> = WriteOperationMap[Resource]["result"];

export const readOperationMetadata: Record<ReadResource, OperationMetadata> = {
  "marketing.hero": { domain: "marketing", description: "Hero da landing page", requiresLoja: false },
  "marketing.diferenciais": { domain: "marketing", description: "Cards de diferenciais", requiresLoja: false },
  "rpc.empresa_do_usuario": { domain: "auth", description: "Descoberta da empresa vinculada", requiresLoja: false },
  "convites.validarToken": { domain: "convites", description: "Validação de token de convite", requiresLoja: false },
  "contexto.concessionaria": { domain: "contexto", description: "Contexto inicial da concessionária", requiresLoja: false },
  "permissoes.modulos": { domain: "contexto", description: "Permissões por módulo", requiresLoja: false },
  "dashboard.metricas": { domain: "dashboard", description: "Métricas consolidadas", requiresLoja: false },
  "estoque.recentes": { domain: "estoque", description: "Veículos recentes", requiresLoja: false },
  "estoque.buscar": { domain: "estoque", description: "Busca no estoque", requiresLoja: false },
  "estoque.listar": { domain: "estoque", description: "Listagem do estoque", requiresLoja: false },
  "estoque.detalhes": { domain: "estoque", description: "Detalhes do veículo", requiresLoja: false },
  "anuncios.listarPorPlataforma": { domain: "anuncios", description: "Agrupamento por plataforma", requiresLoja: true },
  "anuncios.listar": { domain: "anuncios", description: "Listagem por plataforma", requiresLoja: true },
  "anuncios.detalhes": { domain: "anuncios", description: "Detalhes do anúncio", requiresLoja: true },
  "vitrine.listar": { domain: "vitrine", description: "Veículos na vitrine da loja", requiresLoja: true },
  "vitrine.disponiveis": { domain: "vitrine", description: "Veículos disponíveis para adicionar", requiresLoja: true },
  "vitrine.resumo": { domain: "vitrine", description: "Resumo do veículo na vitrine", requiresLoja: true },
  "vitrine.detalhes": { domain: "vitrine", description: "Detalhes completos da vitrine", requiresLoja: true },
  "vitrine.relacionamentos": { domain: "vitrine", description: "Relacionamentos de compartilhamento entre lojas", requiresLoja: true },
  "vendas.insights": { domain: "vendas", description: "Insights de vendas", requiresLoja: false },
  "vendas.recentes": { domain: "vendas", description: "Últimas vendas", requiresLoja: false },
  "vendas.pipeline": { domain: "vendas", description: "Pipeline de vendas", requiresLoja: false },
  "vendas.analisesComparativas": { domain: "vendas", description: "Comparativos de vendas", requiresLoja: false },
  "vendas.detalhes": { domain: "vendas", description: "Detalhes da venda", requiresLoja: false },
  "promocoes.tabelaPrecos": { domain: "promocoes", description: "Tabela de preços por loja", requiresLoja: true },
  "promocoes.campanhas": { domain: "promocoes", description: "Resumo das promoções em vigor", requiresLoja: true },
  "usuarios.lojasDisponiveis": { domain: "usuarios", description: "Lojas disponíveis para o usuário", requiresLoja: false },
  "usuarios.perfil": { domain: "usuarios", description: "Dados de perfil", requiresLoja: false },
  "usuarios.preferencias": { domain: "usuarios", description: "Preferências rápidas", requiresLoja: false },
  "cadastros.contextos": { domain: "cadastros", description: "Contextos dos cadastros", requiresLoja: false },
  "cadastros.listar": { domain: "cadastros", description: "Itens de cadastro", requiresLoja: false },
  "modelos.detalhes": { domain: "cadastros", description: "Detalhe de modelo", requiresLoja: false },
  "avisos.pendencias": { domain: "avisos", description: "Pendências operacionais", requiresLoja: false }
};

export const writeOperationMetadata: Record<WriteResource, OperationMetadata> = {
  "auth.login": { domain: "auth", description: "Autenticação de usuário", requiresLoja: false },
  "empresas.criar": { domain: "empresas", description: "Criação de empresa", requiresLoja: false },
  "convites.aceitar": { domain: "convites", description: "Aceite de convite", requiresLoja: false },
  "usuarios.definirLojaAtual": { domain: "usuarios", description: "Define loja atual do usuário", requiresLoja: false },
  "estoque.criar": { domain: "estoque", description: "Criação de veículo", requiresLoja: false },
  "estoque.importarLote": { domain: "estoque", description: "Importação de planilha", requiresLoja: false },
  "estoque.duplicar": { domain: "estoque", description: "Duplicação de veículo", requiresLoja: false },
  "estoque.arquivar": { domain: "estoque", description: "Arquivamento de veículo", requiresLoja: false },
  "estoque.atualizar": { domain: "estoque", description: "Atualização de dados do veículo", requiresLoja: false },
  "estoque.gerenciarMidia": { domain: "estoque", description: "Gerenciamento de mídia do veículo", requiresLoja: false },
  "anuncios.publicar": { domain: "anuncios", description: "Publicação de anúncio", requiresLoja: true },
  "anuncios.atualizar": { domain: "anuncios", description: "Atualização de anúncio", requiresLoja: true },
  "anuncios.remover": { domain: "anuncios", description: "Remoção de anúncio", requiresLoja: true },
  "anuncios.syncLote": { domain: "anuncios", description: "Sincronização em lote", requiresLoja: true },
  "vitrine.removerVeiculo": { domain: "vitrine", description: "Remoção de veículo da vitrine", requiresLoja: true },
  "vitrine.adicionarVeiculo": { domain: "vitrine", description: "Adição de veículo à vitrine", requiresLoja: true },
  "vendas.registrar": { domain: "vendas", description: "Registro de nova venda", requiresLoja: true },
  "vendas.atualizar": { domain: "vendas", description: "Atualização de venda", requiresLoja: true },
  "promocoes.aplicarAjuste": { domain: "promocoes", description: "Aplicação de ajuste promocional", requiresLoja: true },
  "promocoes.atualizar": { domain: "promocoes", description: "Atualização de promoção", requiresLoja: true },
  "promocoes.reverter": { domain: "promocoes", description: "Reversão de promoção", requiresLoja: true },
  "usuarios.atualizarPerfil": { domain: "usuarios", description: "Atualização de perfil", requiresLoja: false },
  "usuarios.atualizarCampos": { domain: "usuarios", description: "Atualização de campos específicos", requiresLoja: false },
  "usuarios.atualizarPreferencias": { domain: "usuarios", description: "Atualização de preferências", requiresLoja: false },
  "usuarios.alterarSenha": { domain: "usuarios", description: "Alteração de senha", requiresLoja: false },
  "usuarios.ativarMFA": { domain: "usuarios", description: "Ativação de MFA", requiresLoja: false },
  "cadastros.salvar": { domain: "cadastros", description: "Salvar item de cadastro", requiresLoja: false },
  "cadastros.excluir": { domain: "cadastros", description: "Excluir item de cadastro", requiresLoja: false },
  "modelos.criar": { domain: "cadastros", description: "Criar modelo", requiresLoja: false },
  "modelos.atualizar": { domain: "cadastros", description: "Atualizar modelo", requiresLoja: false },
  "modelos.remover": { domain: "cadastros", description: "Remover modelo", requiresLoja: false }
};
