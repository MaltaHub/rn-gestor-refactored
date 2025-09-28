import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabaseClientOrThrow,
  isSupabaseEnabled,
  callRpc,
  SupabaseServiceError,
  handlePostgrestError,
} from "./supabase-rpc";

import type { Veiculo, VeiculoCaracteristica, VeiculoLojaResumo } from "@/types/estoque";
import type {
  Caracteristica,
  DocumentacaoVeiculo,
  FotoMetadata,
  TemFotos,
  VeiculoLoja,
} from "@/types/supabase";

import { getCaracteristicaById, getLocalById, getLojaById, getModeloById } from "./configuracoes";

const RPC_VEICULOS = "rpc_veiculos";

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const deepClone = <T>(value: T): T => {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

const buildModelo = (modeloId?: string | null) => {
  const modelo = getModeloById(modeloId);

  if (!modelo || !modelo.id) {
    return null;
  }

  const {
    id,
    marca,
    nome,
    combustivel,
    tipo_cambio,
    motor,
    lugares,
    portas,
    cabine,
    tracao,
    carroceria,
  } = modelo;

  return {
    id,
    marca,
    nome,
    combustivel,
    tipo_cambio,
    motor,
    lugares,
    portas,
    cabine,
    tracao,
    carroceria,
  };
};

const buildLocal = (localId?: string | null) => {
  const local = getLocalById(localId);

  if (!local || !local.id) {
    return null;
  }

  const { id, nome } = local;
  return { id, nome };
};

const buildLojaResumo = (
  lojaId?: string | null,
  overrides: Partial<Omit<VeiculoLojaResumo, "loja_id">> = {},
): VeiculoLojaResumo | null => {
  if (!lojaId) {
    return null;
  }

  const loja = getLojaById(lojaId);

  if (!loja || !loja.id) {
    return null;
  }

  return {
    id: overrides.id ?? `veiculo-loja-${lojaId}`,
    loja_id: lojaId,
    preco: overrides.preco ?? null,
    data_entrada: overrides.data_entrada ?? null,
    loja: { id: loja.id, nome: loja.nome },
  };
};

const buildCaracteristicas = (ids: (string | undefined)[] = []) =>
  ids
    .map((caracteristicaId) => {
      const caracteristica = getCaracteristicaById(caracteristicaId);
      if (!caracteristica || !caracteristica.id) {
        return null;
      }

      return { id: caracteristica.id, nome: caracteristica.nome } satisfies VeiculoCaracteristica;
    })
    .filter(Boolean) as VeiculoCaracteristica[];

const toArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

let veiculos: Veiculo[] = [
  {
    id: "3f7b0a34-2f66-4f93-a3ab-2d1ef5d46a20",
    empresa_id: "empresa-1",
    placa: "ABC1D23",
    hodometro: 18500,
    cor: "Prata",
    estado_venda: "disponivel",
    estado_veiculo: "seminovo",
    preco_venal: 98000,
    modelo_id: "modelo-corolla-xei",
    local_id: "local-showroom-centro",
    estagio_documentacao: "em_andamento",
    observacao: "Revisão completa realizada há 3 meses.",
    chassi: "9BWZZZ377VT004251",
    ano_modelo: 2023,
    ano_fabricacao: 2022,
    registrado_em: "2024-02-12T10:15:00Z",
    registrado_por: "usuario-gestor-1",
    editado_em: "2024-03-05T14:45:00Z",
    editado_por: "usuario-gestor-2",
    modelo: buildModelo("modelo-corolla-xei"),
    loja: buildLojaResumo("loja-centro", {
      id: "veiculo-loja-1",
      preco: 102500,
      data_entrada: "2024-02-10",
    }),
    local: buildLocal("local-showroom-centro"),
    documentacao: {
      empresa_id: "empresa-1",
      veiculo_id: "3f7b0a34-2f66-4f93-a3ab-2d1ef5d46a20",
      loja_id: "loja-centro",
      tem_multas: false,
      tem_manual: true,
      tem_chave_reserva: true,
      tem_nf_compra: true,
      tem_crv: true,
      tem_crlv: true,
      status_geral: "em_andamento",
      tem_dividas_ativas: false,
      tem_restricoes: false,
      transferencia_iniciada: true,
      transferencia_concluida: false,
      data_entrada: "2024-02-10",
      criado_em: "2024-02-10T10:00:00Z",
      atualizado_em: "2024-03-02T09:30:00Z",
      observacoes_gerais: "Aguardando vistoria complementar.",
      vistoria_realizada: true,
      data_vistoria: "2024-02-20",
      aprovada_vistoria: true,
    },
    caracteristicas: buildCaracteristicas(["cf-ac", "cf-dir", "cf-bt"]),
    midia: {
      controle: {
        empresa_id: "empresa-1",
        veiculo_id: "3f7b0a34-2f66-4f93-a3ab-2d1ef5d46a20",
        loja_id: "loja-centro",
        qtd_fotos: 18,
      },
      fotos: [
        {
          id: "foto-1",
          empresa_id: "empresa-1",
          loja_id: "loja-centro",
          veiculo_id: "3f7b0a34-2f66-4f93-a3ab-2d1ef5d46a20",
          path: "veiculos/3f7b0a34/foto-dianteira.jpg",
          ordem: 1,
          e_capa: true,
        },
        {
          id: "foto-2",
          empresa_id: "empresa-1",
          loja_id: "loja-centro",
          veiculo_id: "3f7b0a34-2f66-4f93-a3ab-2d1ef5d46a20",
          path: "veiculos/3f7b0a34/foto-interior.jpg",
          ordem: 2,
        },
      ],
    },
    anuncios: [
      {
        id: "anuncio-1",
        empresa_id: "empresa-1",
        entidade_id: "entidade-1",
        plataforma_id: "web",
        tipo_anuncio: "vitrine",
        titulo: "Toyota Corolla XEi 2023",
        tipo_identificador_fisico: "placa",
        identificador_fisico: "ABC1D23",
        data_publicacao: "2024-02-15",
        status: "ativo",
        preco: 102500,
        criado_em: "2024-02-12T11:00:00Z",
        atualizado_em: "2024-03-01T09:00:00Z",
      },
    ],
  },
  {
    id: "a9285fe8-9017-4b8a-a6c0-6fa61a5b748b",
    empresa_id: "empresa-1",
    placa: "EFG4H56",
    hodometro: 45200,
    cor: "Preto",
    estado_venda: "reservado",
    estado_veiculo: "usado",
    preco_venal: 87500,
    modelo_id: "modelo-civic-touring",
    local_id: "local-patio",
    estagio_documentacao: "aguardando_cliente",
    observacao: "Cliente interessado finalizando financiamento.",
    ano_modelo: 2021,
    ano_fabricacao: 2020,
    registrado_em: "2024-01-05T09:20:00Z",
    registrado_por: "usuario-gestor-3",
    modelo: buildModelo("modelo-civic-touring"),
    loja: buildLojaResumo("loja-zona-norte", {
      id: "veiculo-loja-2",
      preco: 89990,
      data_entrada: "2024-01-08",
    }),
    local: buildLocal("local-patio"),
    documentacao: {
      empresa_id: "empresa-1",
      veiculo_id: "a9285fe8-9017-4b8a-a6c0-6fa61a5b748b",
      loja_id: "loja-zona-norte",
      tem_multas: true,
      tem_manual: true,
      tem_chave_reserva: false,
      tem_nf_compra: true,
      tem_crv: true,
      tem_crlv: true,
      status_geral: "aguardando_cliente",
      tem_dividas_ativas: false,
      tem_restricoes: true,
      observacoes_restricoes:
        "Consulta aponta restrição financeira, aguardando baixa.",
      observacoes_multas: "Multa de R$350 aguardando pagamento pelo cliente.",
      transferencia_iniciada: false,
      transferencia_concluida: false,
      criado_em: "2024-01-08T10:00:00Z",
      atualizado_em: "2024-02-22T16:10:00Z",
    },
    caracteristicas: buildCaracteristicas(["cf-teto", "cf-pilot"]),
    midia: {
      controle: {
        empresa_id: "empresa-1",
        veiculo_id: "a9285fe8-9017-4b8a-a6c0-6fa61a5b748b",
        loja_id: "loja-zona-norte",
        qtd_fotos: 10,
      },
    },
    anuncios: [],
  },
  {
    id: "54d2d60f-9782-4d7c-988a-2fee4ab3fc54",
    empresa_id: "empresa-2",
    placa: "IJK7L89",
    hodometro: 6200,
    cor: "Branco",
    estado_venda: "disponivel",
    estado_veiculo: "novo",
    preco_venal: 76500,
    modelo_id: "modelo-onix-premier",
    local_id: "local-showroom-sul",
    estagio_documentacao: "pendente",
    ano_modelo: 2024,
    ano_fabricacao: 2024,
    registrado_em: "2024-03-18T08:40:00Z",
    registrado_por: "usuario-gestor-4",
    modelo: buildModelo("modelo-onix-premier"),
    loja: buildLojaResumo("loja-zona-sul", {
      id: "veiculo-loja-3",
      preco: 78900,
      data_entrada: "2024-03-17",
    }),
    local: buildLocal("local-showroom-sul"),
    documentacao: {
      empresa_id: "empresa-2",
      veiculo_id: "54d2d60f-9782-4d7c-988a-2fee4ab3fc54",
      loja_id: "loja-zona-sul",
      status_geral: "pendente",
      tem_manual: true,
      tem_chave_reserva: true,
      tem_nf_compra: true,
      tem_crv: false,
      tem_crlv: false,
      criado_em: "2024-03-18T08:45:00Z",
    },
    caracteristicas: buildCaracteristicas(["cf-camera", "cf-sensor", "cf-conect"]),
    midia: {
      controle: {
        empresa_id: "empresa-2",
        veiculo_id: "54d2d60f-9782-4d7c-988a-2fee4ab3fc54",
        loja_id: "loja-zona-sul",
        qtd_fotos: 6,
      },
    },
    anuncios: [
      {
        id: "anuncio-5",
        empresa_id: "empresa-2",
        entidade_id: "entidade-2",
        plataforma_id: "marketplace",
        tipo_anuncio: "vitrine",
        titulo: "Onix Premier 2024",
        tipo_identificador_fisico: "placa",
        identificador_fisico: "IJK7L89",
        status: "ativo",
        preco: 78900,
        criado_em: "2024-03-19T12:00:00Z",
      },
    ],
  },
];

export interface VeiculoUpdateInput {
  placa?: string;
  chassi?: string | null;
  hodometro?: number;
  cor?: string;
  estado_venda?: Veiculo["estado_venda"];
  estado_veiculo?: Veiculo["estado_veiculo"];
  estagio_documentacao?: Veiculo["estagio_documentacao"];
  ano_modelo?: number | null;
  ano_fabricacao?: number | null;
  observacao?: string | null;
  preco_venal?: number | null;
  modelo_id?: string | null;
  local_id?: string | null;
  loja?: Partial<VeiculoLojaResumo> & { loja_id?: string | null } | null;
  documentacao?: Partial<DocumentacaoVeiculo> | null;
  caracteristicas_ids?: string[];
  editado_por?: string | null;
}

const applyLoja = (
  current: VeiculoLojaResumo | null | undefined,
  payload: VeiculoUpdateInput["loja"],
) => {
  if (payload === null) {
    return null;
  }

  if (!payload) {
    return current ?? null;
  }

  const lojaId = payload.loja_id ?? current?.loja_id;

  if (!lojaId) {
    return null;
  }

  const base = buildLojaResumo(lojaId, {
    id: payload.id ?? current?.id,
    preco: payload.preco ?? current?.preco ?? null,
    data_entrada: payload.data_entrada ?? current?.data_entrada ?? null,
  });

  return base;
};

const applyDocumentacao = (
  current: DocumentacaoVeiculo | null | undefined,
  payload: VeiculoUpdateInput["documentacao"],
  veiculoId: string,
  empresaId: string,
) => {
  if (payload === null) {
    return null;
  }

  if (!payload) {
    return current ?? null;
  }

  const base: DocumentacaoVeiculo = {
    empresa_id: current?.empresa_id ?? empresaId,
    veiculo_id: current?.veiculo_id ?? veiculoId,
    loja_id: payload.loja_id ?? current?.loja_id,
  } as DocumentacaoVeiculo;

  return { ...base, ...current, ...payload };
};

const applyCaracteristicas = (
  current: VeiculoCaracteristica[] | undefined,
  payload: VeiculoUpdateInput["caracteristicas_ids"],
) => {
  if (!payload) {
    return current ?? [];
  }

  if (payload.length === 0) {
    return [];
  }

  return buildCaracteristicas(payload);
};

const hydrateRelations = (veiculo: Veiculo): Veiculo => ({
  ...veiculo,
  modelo: buildModelo(veiculo.modelo_id),
  local: buildLocal(veiculo.local_id),
  loja: veiculo.loja ? buildLojaResumo(veiculo.loja.loja_id, veiculo.loja) : null,
  caracteristicas: buildCaracteristicas(veiculo.caracteristicas?.map((item) => item.id) ?? []),
});

type CaracteristicaPivotRow = {
  veiculo_id: string;
  caracteristica_id: string;
};

function mapLojaResumo(entry?: VeiculoLoja | null): VeiculoLojaResumo | null {
  if (!entry) {
    return null;
  }

  return {
    id: entry.id ?? undefined,
    loja_id: entry.loja_id,
    preco: entry.preco ?? undefined,
    data_entrada: entry.data_entrada ?? null,
  };
}

function mapMidia(
  controle?: TemFotos | null,
  fotos?: FotoMetadata[],
): Veiculo["midia"] | undefined {
  const orderedFotos = [...(fotos ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const hasControle = Boolean(controle);
  const hasFotos = orderedFotos.length > 0;

  if (!hasControle && !hasFotos) {
    return undefined;
  }

  return {
    controle: controle ?? null,
    fotos: hasFotos ? orderedFotos : undefined,
  };
}

async function enrichVeiculos(client: SupabaseClient, rows: Veiculo[]): Promise<Veiculo[]> {
  if (!rows.length) {
    return [];
  }

  const veiculoIds = rows
    .map((row) => row.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  if (!veiculoIds.length) {
    return [];
  }

  const [
    { data: docs, error: docsError },
    { data: lojas, error: lojasError },
    { data: controles, error: controlesError },
    { data: fotos, error: fotosError },
    { data: carPivot, error: carPivotError },
  ] = await Promise.all([
    client.from<DocumentacaoVeiculo>("documentacao_veiculos").select("*").in("veiculo_id", veiculoIds),
    client.from<VeiculoLoja>("veiculos_loja").select("*").in("veiculo_id", veiculoIds),
    client.from<TemFotos>("tem_fotos").select("*").in("veiculo_id", veiculoIds),
    client.from<FotoMetadata>("fotos_metadados").select("*").in("veiculo_id", veiculoIds),
    client
      .from<CaracteristicaPivotRow>("caracteristicas_veiculos")
      .select("veiculo_id, caracteristica_id")
      .in("veiculo_id", veiculoIds),
  ]);

  if (docsError) await handlePostgrestError(client, "documentacao_veiculos", docsError);
  if (lojasError) await handlePostgrestError(client, "veiculos_loja", lojasError);
  if (controlesError) await handlePostgrestError(client, "tem_fotos", controlesError);
  if (fotosError) await handlePostgrestError(client, "fotos_metadados", fotosError);
  if (carPivotError) await handlePostgrestError(client, "caracteristicas_veiculos", carPivotError);

  const docRows = toArray<DocumentacaoVeiculo>(docs);
  const lojaRows = toArray<VeiculoLoja>(lojas);
  const controleRows = toArray<TemFotos>(controles);
  const fotosRows = toArray<FotoMetadata>(fotos);
  const carPivotRows = toArray<CaracteristicaPivotRow>(carPivot);

  const caracteristicaIds = Array.from(
    new Set(
      carPivotRows
        .map((item) => item.caracteristica_id)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  );

  let caracteristicas: Caracteristica[] = [];
  if (caracteristicaIds.length) {
    const { data, error } = await client
      .from<Caracteristica>("caracteristicas")
      .select("id, nome")
      .in("id", caracteristicaIds);

    if (error) {
      await handlePostgrestError(client, "caracteristicas", error);
    }

    caracteristicas = toArray<Caracteristica>(data);
  }

  const docMap = new Map<string, DocumentacaoVeiculo>();
  docRows.forEach((doc) => {
    if (doc?.veiculo_id) {
      docMap.set(doc.veiculo_id, doc);
    }
  });

  const lojaMap = new Map<string, VeiculoLoja>();
  lojaRows.forEach((entry) => {
    if (entry?.veiculo_id && !lojaMap.has(entry.veiculo_id)) {
      lojaMap.set(entry.veiculo_id, entry);
    }
  });

  const temFotosMap = new Map<string, TemFotos>();
  controleRows.forEach((entry) => {
    if (entry?.veiculo_id) {
      temFotosMap.set(entry.veiculo_id, entry);
    }
  });

  const fotosMap = new Map<string, FotoMetadata[]>();
  fotosRows.forEach((foto) => {
    if (!foto?.veiculo_id) {
      return;
    }
    const current = fotosMap.get(foto.veiculo_id) ?? [];
    current.push(foto);
    fotosMap.set(foto.veiculo_id, current);
  });

  const caracteristicaById = new Map<string, Caracteristica>();
  caracteristicas.forEach((item) => {
    if (item.id) {
      caracteristicaById.set(item.id, item);
    }
  });

  const caracteristicasMap = new Map<string, VeiculoCaracteristica[]>();
  carPivotRows.forEach((pivot) => {
    if (!pivot?.veiculo_id || !pivot.caracteristica_id) {
      return;
    }

    const base = caracteristicaById.get(pivot.caracteristica_id);
    if (!base || !base.id) {
      return;
    }

    const list = caracteristicasMap.get(pivot.veiculo_id) ?? [];
    list.push({ id: base.id, nome: base.nome });
    caracteristicasMap.set(pivot.veiculo_id, list);
  });

  return rows.map((row) => {
    const veiculoId = String(row.id);
    const lojaResumo = mapLojaResumo(lojaMap.get(veiculoId));
    const midia = mapMidia(temFotosMap.get(veiculoId), fotosMap.get(veiculoId));

    const veiculoBase = {
      ...row,
      id: veiculoId,
      documentacao: docMap.get(veiculoId) ?? null,
      loja: lojaResumo,
      midia,
      caracteristicas: caracteristicasMap.get(veiculoId) ?? [],
      anuncios: (row.anuncios as Veiculo["anuncios"]) ?? [],
    } as Veiculo;

    return hydrateRelations(veiculoBase);
  });
}
type RpcVeiculosResponse = {
  sucesso?: boolean;
  erro?: string | null;
  mensagem?: string | null;
  veiculo_id?: string | null;
  total_aplicadas?: number | null;
};

// --- Supabase wrappers ----------------------------------------------------

async function listVeiculosSupabase(): Promise<Veiculo[]> {
  const client = getSupabaseClientOrThrow();
  const { data, error } = await client
    .from<Veiculo>("veiculos")
    .select("*")
    .order("registrado_em", { ascending: false });

  if (error) {
    await handlePostgrestError(client, "veiculos", error);
  }

  const rows = toArray<Veiculo>(data);
  return enrichVeiculos(client, rows);
}

async function getVeiculoSupabase(id: string): Promise<Veiculo | undefined> {
  const client = getSupabaseClientOrThrow();
  const { data, error } = await client
    .from<Veiculo>("veiculos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    await handlePostgrestError(client, "veiculos", error);
  }

  if (!data) {
    return undefined;
  }

  const [veiculo] = await enrichVeiculos(client, [data as Veiculo]);
  return veiculo;
}

async function updateVeiculoSupabase(id: string, payload: VeiculoUpdateInput): Promise<Veiculo> {
  const response = await callRpc<RpcVeiculosResponse | null>(RPC_VEICULOS, {
    args: {
      p_payload: {
        operacao: "atualizar",
        veiculo_id: id,
        veiculo: payload,
      },
    },
  });

  if (!response || response.sucesso === false) {
    const erro = response?.erro ?? "Falha ao atualizar veículo através da RPC.";
    throw new SupabaseServiceError(erro);
  }

  const targetId = response.veiculo_id ?? id;
  const data = await getVeiculoSupabase(targetId);

  if (!data) {
    throw new SupabaseServiceError(
      "Veículo atualizado, mas não foi possível obter os dados consolidados na sequência.",
    );
  }

  return data;
}

// --- Mock fallback --------------------------------------------------------

async function listVeiculosMock(): Promise<Veiculo[]> {
  await delay();
  return veiculos.map((veiculo) => deepClone(veiculo));
}

async function getVeiculoMock(id: string): Promise<Veiculo | undefined> {
  await delay();
  const veiculo = veiculos.find((item) => item.id === id);
  return veiculo ? deepClone(veiculo) : undefined;
}

async function updateVeiculoMock(id: string, payload: VeiculoUpdateInput): Promise<Veiculo> {
  await delay();
  const index = veiculos.findIndex((item) => item.id === id);

  if (index < 0) {
    throw new Error("Veículo não encontrado");
  }

  const current = veiculos[index];
  const {
    modelo_id,
    local_id,
    loja,
    documentacao,
    caracteristicas_ids,
    editado_por,
    ...rest
  } = payload;

  const next: Veiculo = {
    ...current,
    ...rest,
    modelo_id: modelo_id ?? current.modelo_id,
    local_id: local_id ?? current.local_id,
  };

  next.loja = applyLoja(current.loja, loja);
  next.documentacao = applyDocumentacao(
    current.documentacao,
    documentacao,
    current.id,
    current.empresa_id,
  );
  next.caracteristicas = applyCaracteristicas(current.caracteristicas, caracteristicas_ids);

  next.modelo = buildModelo(next.modelo_id);
  next.local = buildLocal(next.local_id);
  next.editado_em = new Date().toISOString();
  next.editado_por = editado_por ?? current.editado_por ?? "usuario-demo";

  veiculos[index] = hydrateRelations(next);

  return deepClone(veiculos[index]);
}

// --- Public API -----------------------------------------------------------

export async function listVeiculos(): Promise<Veiculo[]> {
  if (isSupabaseEnabled()) {
    try {
      return await listVeiculosSupabase();
    } catch (error) {
      if (error instanceof SupabaseServiceError) {
        throw error;
      }

      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }

      console.error("Falha ao executar RPC veiculos_listar; utilizando dados mock.", error);
    }
  }

  return listVeiculosMock();
}

export async function getVeiculo(id: string): Promise<Veiculo | undefined> {
  if (isSupabaseEnabled()) {
    try {
      return await getVeiculoSupabase(id);
    } catch (error) {
      if (error instanceof SupabaseServiceError) {
        throw error;
      }

      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }

      console.error(
        `Falha ao executar RPC veiculo_obter (${id}); utilizando dados mock.`,
        error,
      );
    }
  }

  return getVeiculoMock(id);
}

export async function updateVeiculo(
  id: string,
  payload: VeiculoUpdateInput,
): Promise<Veiculo> {
  if (isSupabaseEnabled()) {
    try {
      return await updateVeiculoSupabase(id, payload);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }

      if (error instanceof SupabaseServiceError) {
        throw error;
      }

      console.error(
        "Falha ao executar RPC rpc_veiculos (operacao=atualizar); tentando fallback.",
        error,
      );
    }
  }

  return updateVeiculoMock(id, payload);
}

export async function resetVeiculos(dataset: Veiculo[]): Promise<void> {
  veiculos = dataset.map((item) => hydrateRelations(item));
}
