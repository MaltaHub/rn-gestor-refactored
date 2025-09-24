import {
  MOCK_ANALISE_OPERACIONAL,
  MOCK_ANUNCIOS,
  MOCK_ANUNCIOS_AGRUPADOS,
  MOCK_AVISOS,
  MOCK_CADASTRO_CONTEXTOS,
  MOCK_CADASTROS,
  MOCK_DIFERENCIAIS,
  MOCK_EMPRESA,
  MOCK_EMPRESA_VINCULO,
  MOCK_HERO,
  MOCK_LOJAS,
  MOCK_LOJAS_DISPONIVEIS,
  MOCK_MODELOS_DETALHE,
  MOCK_PERMISSOES,
  MOCK_PIPELINE_RESUMO,
  MOCK_PROMOCOES,
  MOCK_USUARIO,
  MOCK_PREFERENCIAS,
  MOCK_VEHICLES_DETAIL,
  MOCK_VEHICLES_SUMMARY,
  MOCK_VENDA_INSIGHT,
  MOCK_VENDAS,
  MOCK_VENDAS_RESUMO
} from "./mock-data";
import type { ReadHandler, RequestScope, WriteHandler } from "./types";
import type { ReadResource, WriteResource } from "./operations";
import { readOperationMetadata, writeOperationMetadata } from "./operations";

function applyPaginacao<T>(itens: T[], pagina = 1, porPagina = itens.length) {
  const start = (pagina - 1) * porPagina;
  const end = start + porPagina;
  return {
    itens: itens.slice(start, end),
    total: itens.length,
    pagina,
    porPagina
  };
}

function normalizarTexto(valor?: string) {
  return valor?.normalize("NFD").replace(/[^\w\s]/g, "").toLowerCase();
}

function assertLoja(scope: RequestScope, resource: string) {
  if (!scope.loja) {
    console.warn(
      `[mock:${resource}] Operação exige contexto de loja. Considere fornecer scope.loja ou revisar o LojaSwitch.`
    );
  }
}

const plataformaNomes: Record<string, string> = {
  webmotors: "Webmotors",
  "plat-webmotors": "Webmotors",
  icarros: "iCarros",
  "plat-icarros": "iCarros",
  olx: "OLX"
};

function defineReadMocks<T extends Partial<{ [Resource in ReadResource]: ReadHandler<Resource> }>>(mocks: T): T {
  return mocks;
}

function defineWriteMocks<T extends Partial<{ [Resource in WriteResource]: WriteHandler<Resource> }>>(mocks: T): T {
  return mocks;
}

const readMockImplementations = defineReadMocks({
  "marketing.hero": () => MOCK_HERO,
  "marketing.diferenciais": () => MOCK_DIFERENCIAIS,
  "rpc.empresa_do_usuario": () => MOCK_EMPRESA_VINCULO,
  "convites.validarToken": ({ token }) =>
    token === "VALIDO"
      ? {
          valido: true,
          empresa: MOCK_EMPRESA,
          expiraEm: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()
        }
      : {
          valido: false,
          mensagem: "Convite inválido ou expirado"
        },
  "contexto.concessionaria": (_params, scope) => ({
    empresa: MOCK_EMPRESA,
    lojas: MOCK_LOJAS,
    estoqueCompartilhado: true,
    lojaAtualId: scope.loja ?? MOCK_LOJAS[0]?.id ?? null
  }),
  "permissoes.modulos": () => MOCK_PERMISSOES,
  "dashboard.metricas": () => ({
    cards: [
      { id: "estoque", label: "Veículos em estoque", value: String(MOCK_VEHICLES_SUMMARY.length), trend: "up", trendValue: "+8%" },
      { id: "anuncios", label: "Anúncios ativos", value: "5", trend: "steady" },
      { id: "vendas", label: "Vendas no mês", value: "14", trend: "up", trendValue: "+12%" }
    ],
    totalVeiculos: MOCK_VEHICLES_SUMMARY.length,
    lojasAtivas: MOCK_LOJAS.filter((loja) => loja.ativa).length,
    vendasUltimos7Dias: 6,
    atualizacaoEm: new Date().toISOString()
  }),
  "estoque.recentes": ({ limite = 5 }) => MOCK_VEHICLES_SUMMARY.slice(0, limite),
  "estoque.buscar": (filtros) => {
    const { pagina = 1, porPagina = 10, termo, lojaId, cor, ano } = filtros;
    const termoNormalizado = normalizarTexto(termo);
    const corNormalizada = cor?.toLowerCase();
    const itensFiltrados = MOCK_VEHICLES_SUMMARY.filter((veiculo) => {
      const casaLoja = !lojaId || veiculo.lojaId === lojaId;
      const casaCor = !corNormalizada || veiculo.cor.toLowerCase() === corNormalizada;
      const casaAno =
        !ano || veiculo.anoModelo === ano || veiculo.anoFabricacao === ano;
      const camposTexto = [
        veiculo.placa,
        veiculo.modeloMarca ?? "",
        veiculo.modeloNome ?? "",
        veiculo.anuncioTitulo ?? ""
      ].join(" ");
      const camposNormalizados = normalizarTexto(camposTexto) ?? "";
      const casaTermo = termoNormalizado ? camposNormalizados.includes(termoNormalizado) : true;
      return casaLoja && casaCor && casaAno && casaTermo;
    });
    return applyPaginacao(itensFiltrados, pagina, porPagina);
  },
  "estoque.listar": (filtros) => {
    const { pagina = 1, porPagina = 10 } = filtros;
    return applyPaginacao(MOCK_VEHICLES_SUMMARY, pagina, porPagina);
  },
  "estoque.detalhes": ({ id }) => MOCK_VEHICLES_DETAIL.find((veiculo) => veiculo.id === id) ?? null,
  "anuncios.listarPorPlataforma": (filtros, scope) => {
    assertLoja(scope, "anuncios.listarPorPlataforma");
    const lojaId = scope.loja ?? filtros.lojaId;
    const plataformaId = filtros.plataformaId;
    const status = filtros.status;

    return MOCK_ANUNCIOS_AGRUPADOS
      .filter((grupo) => {
        const casaLoja = !lojaId || grupo.lojaId === lojaId;
        const casaPlataforma = !plataformaId || grupo.plataformaId === plataformaId;
        return casaLoja && casaPlataforma;
      })
      .map((grupo) => ({
        plataformaId: grupo.plataformaId,
        plataformaNome: plataformaNomes[grupo.plataformaId] ?? grupo.plataformaNome,
        lojaId: grupo.lojaId,
        veiculos: grupo.veiculos.filter((anuncio) => !status || anuncio.status === status)
      }))
      .filter((grupo) => grupo.veiculos.length > 0);
  },
  "anuncios.listar": (filtros, scope) => {
    assertLoja(scope, "anuncios.listar");
    const lojaId = scope.loja ?? filtros.lojaId;
    const plataformaId = filtros.plataformaId;
    const status = filtros.status;
    const veiculoId = filtros.veiculoId;
    return MOCK_ANUNCIOS.filter((anuncio) => {
      const casaLoja = !lojaId || anuncio.lojaId === lojaId;
      const casaPlataforma = !plataformaId || anuncio.plataformaId === plataformaId;
      const casaStatus = !status || anuncio.status === status;
      const casaVeiculo = !veiculoId || anuncio.veiculoId === veiculoId;
      return casaLoja && casaPlataforma && casaStatus && casaVeiculo;
    }).map(
      ({
        descricao,
        descricaoOriginal,
        tituloOriginal,
        link,
        tipoIdentificador,
        identificador,
        publicadoEm,
        expiraEm,
        metricas,
        ...rest
      }) => rest
    );
  },
  "anuncios.detalhes": ({ vehicleId, platformId }, scope) => {
    assertLoja(scope, "anuncios.detalhes");
    const lojaId = scope.loja;
    return (
      MOCK_ANUNCIOS.find(
        (anuncio) =>
          anuncio.veiculoId === vehicleId && anuncio.plataformaId === platformId && (!lojaId || anuncio.lojaId === lojaId)
      ) ?? null
    );
  },
  "vendas.insights": (filtros) => {
    const resultado = { ...MOCK_VENDA_INSIGHT };
    if (filtros.lojaId) {
      const quantidade = resultado.desempenhoPorLoja[filtros.lojaId] ?? 0;
      resultado.desempenhoPorLoja = { [filtros.lojaId]: quantidade };
      resultado.totalVendas = quantidade;
    }
    return resultado;
  },
  "vendas.recentes": (filtros) => {
    const lojaId = filtros.lojaId;
    return lojaId ? MOCK_VENDAS_RESUMO.filter((venda) => venda.lojaId === lojaId) : MOCK_VENDAS_RESUMO;
  },
  "vendas.pipeline": () => MOCK_PIPELINE_RESUMO,
  "vendas.analisesComparativas": () => MOCK_ANALISE_OPERACIONAL,
  "vendas.detalhes": ({ id }) => MOCK_VENDAS.find((venda) => venda.id === id) ?? null,
  "promocoes.tabelaPrecos": (filtros, scope) => {
    const lojaId = scope.loja ?? filtros.lojaId;
    assertLoja({ ...scope, loja: lojaId }, "promocoes.tabelaPrecos");
    const base = lojaId ? MOCK_PROMOCOES.filter((entrada) => entrada.lojaId === lojaId) : MOCK_PROMOCOES;
    return base.map(({ lojaId: _, veiculoId, ...rest }) => rest);
  },
  "promocoes.campanhas": (filtros, scope) => {
    const lojaId = scope.loja ?? filtros.lojaId;
    assertLoja({ ...scope, loja: lojaId }, "promocoes.campanhas");
    return lojaId ? MOCK_PROMOCOES.filter((promo) => promo.lojaId === lojaId) : MOCK_PROMOCOES;
  },
  "usuarios.lojasDisponiveis": () => MOCK_LOJAS_DISPONIVEIS,
  "usuarios.perfil": () => MOCK_USUARIO,
  "usuarios.preferencias": () => MOCK_PREFERENCIAS,
  "cadastros.contextos": () => MOCK_CADASTRO_CONTEXTOS,
  "cadastros.listar": ({ tipo }) => MOCK_CADASTROS[tipo] ?? [],
  "modelos.detalhes": ({ id }) => MOCK_MODELOS_DETALHE.find((modelo) => modelo.id === id) ?? null,
  "avisos.pendencias": () => MOCK_AVISOS
});

const writeMockImplementations = defineWriteMocks({
  "auth.login": async ({ email: _email, password: _password }, _scope) => ({
    token: "mock-token",
    usuarioId: "usr-001",
    expiracao: new Date(Date.now() + 1000 * 60 * 60).toISOString()
  }),
  "empresas.criar": async ({ nome }, _scope) => ({
    empresaId: MOCK_EMPRESA.id,
    empresaNome: nome,
    lojaPadraoId: MOCK_LOJAS[0]?.id ?? null,
    lojas: MOCK_LOJAS,
    perfilCompleto: false
  }),
  "convites.aceitar": async ({ token: _token }, _scope) => ({
    sucesso: true,
    empresa: {
      empresaId: MOCK_EMPRESA.id,
      empresaNome: MOCK_EMPRESA.nome,
      lojaPadraoId: MOCK_LOJAS[0]?.id ?? null,
      lojas: MOCK_LOJAS,
      perfilCompleto: true
    }
  }),
  "usuarios.definirLojaAtual": async ({ lojaId }, _scope) => ({ lojaId }),
  "estoque.criar": async ({ dados: _dados }, _scope) => ({ veiculoId: `veh-${Math.floor(Math.random() * 1000)}` }),
  "estoque.importarLote": async ({ arquivoId: _arquivoId }, _scope) => ({ protocolo: `IMP-${Date.now()}` }),
  "estoque.duplicar": async ({ idVeiculo }, _scope) => ({ novoVeiculoId: `${idVeiculo}-dup` }),
  "estoque.arquivar": async ({ idVeiculo: _idVeiculo }, _scope) => ({ arquivado: true }),
  "estoque.atualizar": async ({ idVeiculo: _idVeiculo, dados: _dados }, _scope) => ({ atualizado: true }),
  "estoque.gerenciarMidia": async ({ idVeiculo: _idVeiculo, fotos: _fotos, lojaId: _lojaId }, _scope) => ({ salvo: true }),
  "anuncios.publicar": async ({ veiculoId: _veiculoId, plataformaId: _plataformaId, lojaId: _lojaId }, _scope) => ({ publicado: true }),
  "anuncios.atualizar": async (
    { veiculoId: _veiculoId, plataformaId: _plataformaId, lojaId: _lojaId, dados: _dados },
    _scope
  ) => ({ atualizado: true }),
  "anuncios.remover": async ({ veiculoId: _veiculoId, plataformaId: _plataformaId, lojaId: _lojaId }, _scope) => ({ removido: true }),
  "anuncios.syncLote": async ({ arquivoId: _arquivoId, lojaId: _lojaId }, _scope) => ({ protocolo: `SYNC-${Date.now()}` }),
  "vendas.registrar": async ({ dados: _dados, lojaId: _lojaId }, _scope) => ({ vendaId: `ven-${Math.floor(Math.random() * 1000)}` }),
  "vendas.atualizar": async ({ id: _id, dados: _dados, lojaId: _lojaId }, _scope) => ({ atualizado: true }),
  "promocoes.aplicarAjuste": async (
    { veiculoId: _veiculoId, lojaId: _lojaId, precoPromocional: _preco },
    _scope
  ) => ({ aplicado: true }),
  "promocoes.atualizar": async (
    { promocaoId: _promocaoId, lojaId: _lojaId, dados: _dados },
    _scope
  ) => ({ atualizado: true }),
  "promocoes.reverter": async ({ veiculoId: _veiculoId, lojaId: _lojaId }, _scope) => ({ revertido: true }),
  "usuarios.atualizarPerfil": async ({ dados: _dados }, _scope) => ({ atualizado: true }),
  "usuarios.atualizarCampos": async ({ dados: _dados }, _scope) => ({ atualizado: true }),
  "usuarios.atualizarPreferencias": async ({ preferencias: _preferencias }, _scope) => ({ atualizado: true }),
  "usuarios.alterarSenha": async ({ senhaAtual: _senhaAtual, novaSenha: _novaSenha }, _scope) => ({ atualizado: true }),
  "usuarios.ativarMFA": async ({ metodo: _metodo }, _scope) => ({ ativado: true }),
  "cadastros.salvar": async ({ tipo: _tipo, item: _item }, _scope) => ({ id: `cad-${Date.now()}` }),
  "cadastros.excluir": async ({ tipo: _tipo, id: _id }, _scope) => ({ removido: true }),
  "modelos.criar": async ({ dados: _dados }, _scope) => ({ id: `mod-${Date.now()}` }),
  "modelos.atualizar": async ({ id: _id, dados: _dados }, _scope) => ({ atualizado: true }),
  "modelos.remover": async ({ id: _id }, _scope) => ({ removido: true })
});

export function getReadMock<Resource extends ReadResource>(
  resource: Resource
): ReadHandler<Resource> | undefined {
  return readMockImplementations[resource] as ReadHandler<Resource> | undefined;
}

export function getWriteMock<Resource extends WriteResource>(
  resource: Resource
): WriteHandler<Resource> | undefined {
  return writeMockImplementations[resource] as WriteHandler<Resource> | undefined;
}

export function hasMock(resource: ReadResource | WriteResource): boolean {
  if (resource in readOperationMetadata) {
    return Boolean(readMockImplementations[resource as ReadResource]);
  }
  if (resource in writeOperationMetadata) {
    return Boolean(writeMockImplementations[resource as WriteResource]);
  }
  return false;
}

export type AnyReadHandler = ReadHandler<ReadResource>;
export type AnyWriteHandler = WriteHandler<WriteResource>;
