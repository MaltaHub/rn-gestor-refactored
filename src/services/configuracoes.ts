import {
  callRpc,
  getSupabaseClientOrThrow,
  handlePostgrestError,
  isSupabaseEnabled,
} from "./supabase-rpc";

import type {
  Caracteristica,
  Local,
  Loja,
  Modelo,
  Plataforma,
} from "@/types/supabase";

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const generateId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

const clone = <T>(value: T): T => ({ ...value });
const cloneArray = <T>(items: T[]): T[] => items.map((item) => clone(item));

type EditableEntity<T> = Omit<T, "empresa_id" | "criado_em" | "atualizado_em"> & {
  id?: string | null;
};

type RemovableEntity = { id?: string | null };

type ConfiguracaoArea = "loja" | "plataforma" | "caracteristica" | "modelo" | "local";

type AreaEntityMap = {
  lojas: Loja;
  plataformas: Plataforma;
  caracteristicas: Caracteristica;
  modelos: Modelo;
  locais: Local;
};

type MockStore = {
  [area in ConfiguracaoArea]: AreaEntityMap[area][];
};

type GerenciarOperacao = "criar" | "atualizar" | "apagar";

type GerenciarArgs<A extends ConfiguracaoArea> =
  | { operacao: "criar" | "atualizar"; dados: EditableEntity<AreaEntityMap[A]> }
  | { operacao: "apagar"; id: string };

const CONFIGURACOES_RPC = "rpc_configuracoes";

const MOCK_ID_PREFIX: Record<ConfiguracaoArea, string> = {
  lojas: "loja",
  plataformas: "plataforma",
  caracteristicas: "caracteristica",
  modelos: "modelo",
  locais: "local",
};

const MOCK_EMPRESA_ID = "empresa-1";

const mockStore: MockStore = {
  lojas: [
    { id: "loja-centro", empresa_id: MOCK_EMPRESA_ID, nome: "Loja Centro" },
    { id: "loja-zona-norte", empresa_id: MOCK_EMPRESA_ID, nome: "Loja Zona Norte" },
    { id: "loja-zona-sul", empresa_id: "empresa-2", nome: "Loja Zona Sul" },
  ],
  plataformas: [
    { id: "web", empresa_id: MOCK_EMPRESA_ID, nome: "Site próprio" },
    { id: "marketplace", empresa_id: "empresa-2", nome: "Marketplace" },
  ],
  caracteristicas: [
    { id: "cf-ac", empresa_id: MOCK_EMPRESA_ID, nome: "Ar-condicionado" },
    { id: "cf-dir", empresa_id: MOCK_EMPRESA_ID, nome: "Direção elétrica" },
    { id: "cf-bt", empresa_id: MOCK_EMPRESA_ID, nome: "Bluetooth" },
    { id: "cf-teto", empresa_id: MOCK_EMPRESA_ID, nome: "Teto solar" },
    { id: "cf-pilot", empresa_id: MOCK_EMPRESA_ID, nome: "Piloto automático" },
    { id: "cf-camera", empresa_id: "empresa-2", nome: "Câmera de ré" },
    { id: "cf-sensor", empresa_id: "empresa-2", nome: "Sensor de estacionamento" },
    { id: "cf-conect", empresa_id: "empresa-2", nome: "MyLink" },
  ],
  modelos: [
    {
      id: "modelo-corolla-xei",
      empresa_id: MOCK_EMPRESA_ID,
      marca: "Toyota",
      nome: "Corolla XEi",
      combustivel: "flex",
      tipo_cambio: "automatico",
      motor: "2.0",
      lugares: 5,
      portas: 4,
      cabine: "simples",
      tracao: "dianteira",
      carroceria: "sedan",
    },
    {
      id: "modelo-civic-touring",
      empresa_id: MOCK_EMPRESA_ID,
      marca: "Honda",
      nome: "Civic Touring",
      combustivel: "gasolina",
      tipo_cambio: "automatico",
      motor: "1.5 Turbo",
      lugares: 5,
      portas: 4,
      cabine: "simples",
      tracao: "dianteira",
      carroceria: "sedan",
    },
    {
      id: "modelo-onix-premier",
      empresa_id: "empresa-2",
      marca: "Chevrolet",
      nome: "Onix Premier",
      combustivel: "flex",
      tipo_cambio: "automatico",
      motor: "1.0 Turbo",
      lugares: 5,
      portas: 4,
      cabine: "simples",
      tracao: "dianteira",
      carroceria: "hatch",
    },
  ],
  locais: [
    {
      id: "local-showroom-centro",
      empresa_id: MOCK_EMPRESA_ID,
      nome: "Showroom Central",
    },
    {
      id: "local-patio",
      empresa_id: MOCK_EMPRESA_ID,
      nome: "Pátio Reserva",
    },
    {
      id: "local-showroom-sul",
      empresa_id: "empresa-2",
      nome: "Showroom Zona Sul",
    },
  ],
};

export interface ConfiguracoesSnapshot {
  lojas: Loja[];
  plataformas: Plataforma[];
  caracteristicas: Caracteristica[];
  modelos: Modelo[];
  locais: Local[];
}

const findById = <T extends RemovableEntity>(collection: T[], id?: string | null) =>
  collection.find((item) => item.id === id);

const deleteEntity = <T extends RemovableEntity>(collection: T[], id: string) => {
  const index = collection.findIndex((item) => item.id === id);
  if (index >= 0) {
    collection.splice(index, 1);
  }
};

const toArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const getMockCollection = <A extends ConfiguracaoArea>(area: A) => mockStore[area];

// --- Supabase wrappers ----------------------------------------------------

async function listConfiguracoesSupabase(): Promise<ConfiguracoesSnapshot> {
  const client = getSupabaseClientOrThrow();

  const [
    lojasResponse,
    plataformasResponse,
    caracteristicasResponse,
    modelosResponse,
    locaisResponse,
  ] = await Promise.all([
    client.from("lojas").select("*").order("nome", { ascending: true }),
    client.from("plataformas").select("*").order("nome", { ascending: true }),
    client.from("caracteristicas").select("*").order("nome", { ascending: true }),
    client.from("modelos").select("*").order("nome", { ascending: true }),
    client.from("locais").select("*").order("nome", { ascending: true }),
  ]);

  if (lojasResponse.error) await handlePostgrestError(client, "lojas", lojasResponse.error);
  if (plataformasResponse.error)
    await handlePostgrestError(client, "plataformas", plataformasResponse.error);
  if (caracteristicasResponse.error)
    await handlePostgrestError(client, "caracteristicas", caracteristicasResponse.error);
  if (modelosResponse.error)
    await handlePostgrestError(client, "modelos", modelosResponse.error);
  if (locaisResponse.error) await handlePostgrestError(client, "locais", locaisResponse.error);

  return {
    lojas: toArray<Loja>(lojasResponse.data),
    plataformas: toArray<Plataforma>(plataformasResponse.data),
    caracteristicas: toArray<Caracteristica>(caracteristicasResponse.data),
    modelos: toArray<Modelo>(modelosResponse.data),
    locais: toArray<Local>(locaisResponse.data),
  };
}

function buildSaveArgs<A extends ConfiguracaoArea>(
  input: EditableEntity<AreaEntityMap[A]>,
): GerenciarArgs<A> {
  const operacao: GerenciarOperacao = input.id ? "atualizar" : "criar";

  if (operacao === "atualizar" && !input.id) {
    throw new Error("Operação de atualização requer um identificador válido.");
  }

  console.log("buildSaveArgs", {
    operacao,
    dados: { ...input },
  } as GerenciarArgs<A>);

  return {
    operacao,
    dados: { ...input },
  } as GerenciarArgs<A>;
}

async function gerenciarEntidadeSupabase<A extends ConfiguracaoArea>(
  area: A,
  p_payload: GerenciarArgs<A>,
): Promise<AreaEntityMap[A] | void> {
  const payload =
    p_payload.operacao === "apagar"
      ? { operacao: p_payload.operacao, tipo: area, id: p_payload.id }
      : { operacao: p_payload.operacao, tipo: area, dados: p_payload.dados };

  const rpcArgs: Record<string, unknown> = { p_payload: payload };

  if (p_payload.operacao === "apagar") {
    await callRpc(CONFIGURACOES_RPC, { p_payload: rpcArgs });
    return;
  }

  const data = await callRpc<AreaEntityMap[A] | null>(CONFIGURACOES_RPC, { p_payload: rpcArgs });

  if (!data) {
    throw new Error(`RPC ${CONFIGURACOES_RPC} não retornou dados.`);
  }

  return data;
}

function saveMockEntity<A extends ConfiguracaoArea>(
  area: A,
  input: EditableEntity<AreaEntityMap[A]>,
): AreaEntityMap[A] {
  const collection = getMockCollection(area);
  const id = input.id ?? generateId(MOCK_ID_PREFIX[area]);
  const index = collection.findIndex((item) => item.id === id);
  const base = index >= 0 ? collection[index] : undefined;

  const next = {
    ...(base ?? {}),
    ...input,
    id,
  } as AreaEntityMap[A];

  next.empresa_id = base?.empresa_id ?? next.empresa_id ?? MOCK_EMPRESA_ID;

  if (index >= 0) {
    collection[index] = next;
  } else {
    collection.push(next);
  }

  return clone(next);
}

async function gerenciarEntidadeMock<A extends ConfiguracaoArea>(
  area: A,
  p_payload: GerenciarArgs<A>,
): Promise<AreaEntityMap[A] | void> {
  await delay();

  if (p_payload.operacao === "apagar") {
    deleteEntity(getMockCollection(area), p_payload.id);
    return;
  }

  return saveMockEntity(area, p_payload.dados);
}

async function executarGerenciamento<A extends ConfiguracaoArea>(
  area: A,
  p_payload: GerenciarArgs<A>,
): Promise<AreaEntityMap[A] | void> {
  if (isSupabaseEnabled()) {
    try {
      return await gerenciarEntidadeSupabase(area, p_payload);
    } catch (error) {
      console.error(
        `[Configurações][${area}] Falha ao executar operação "${p_payload.operacao}" via RPC; usando mock.`,
        error,
      );
    }
  }

  return gerenciarEntidadeMock(area, p_payload);
}

// --- Mock fallback --------------------------------------------------------

export const getLojaById = (id?: string | null) => findById(mockStore.lojas, id);
export const getModeloById = (id?: string | null) => findById(mockStore.modelos, id);
export const getLocalById = (id?: string | null) => findById(mockStore.locais, id);
export const getCaracteristicaById = (id?: string | null) =>
  findById(mockStore.caracteristicas, id);
export const getPlataformaById = (id?: string | null) => findById(mockStore.plataformas, id);

async function listConfiguracoesMock(): Promise<ConfiguracoesSnapshot> {
  await delay();
  return {
    lojas: cloneArray(mockStore.lojas),
    plataformas: cloneArray(mockStore.plataformas),
    caracteristicas: cloneArray(mockStore.caracteristicas),
    modelos: cloneArray(mockStore.modelos),
    locais: cloneArray(mockStore.locais),
  };
}

async function listLojasMock(): Promise<Loja[]> {
  await delay();
  return cloneArray(mockStore.lojas);
}

async function listPlataformasMock(): Promise<Plataforma[]> {
  await delay();
  return cloneArray(mockStore.plataformas);
}

async function listCaracteristicasMock(): Promise<Caracteristica[]> {
  await delay();
  return cloneArray(mockStore.caracteristicas);
}

async function listModelosMock(): Promise<Modelo[]> {
  await delay();
  return cloneArray(mockStore.modelos);
}

async function listLocaisMock(): Promise<Local[]> {
  await delay();
  return cloneArray(mockStore.locais);
}

// --- Public API -----------------------------------------------------------

export async function listConfiguracoes(): Promise<ConfiguracoesSnapshot> {
  if (isSupabaseEnabled()) {
    try {
      return await listConfiguracoesSupabase();
    } catch (error) {
      console.error(
        "Falha ao consultar configurações via Supabase; retornando dados mock.",
        error,
      );
    }
  }

  return listConfiguracoesMock();
}

export async function listLojas(): Promise<Loja[]> {
  if (isSupabaseEnabled()) {
    try {
      const snapshot = await listConfiguracoesSupabase();
      return snapshot.lojas;
    } catch (error) {
      console.error("Erro ao listar lojas via Supabase; usando dados mock.", error);
    }
  }

  return listLojasMock();
}

export async function saveLoja(input: EditableEntity<Loja>): Promise<Loja> {
  const p_payload = buildSaveArgs<"lojas">(input);
  const result = await executarGerenciamento("loja", p_payload);
  if (!result) {
    throw new Error("Não foi possível salvar a loja.");
  }
  return result;
}

export async function deleteLoja(id: string): Promise<void> {
  const p_payload: GerenciarArgs<"lojas"> = { operacao: "apagar", id };
  await executarGerenciamento("lojas", p_payload);
}

export async function listPlataformas(): Promise<Plataforma[]> {
  if (isSupabaseEnabled()) {
    try {
      const snapshot = await listConfiguracoesSupabase();
      return snapshot.plataformas;
    } catch (error) {
      console.error("Erro ao listar plataformas via Supabase; usando dados mock.", error);
    }
  }

  return listPlataformasMock();
}

export async function savePlataforma(
  input: EditableEntity<Plataforma>,
): Promise<Plataforma> {
  const p_payload = buildSaveArgs<"plataformas">(input);
  const result = await executarGerenciamento("plataformas", p_payload);
  if (!result) {
    throw new Error("Não foi possível salvar a plataforma.");
  }
  return result;
}

export async function deletePlataforma(id: string): Promise<void> {
  const p_payload: GerenciarArgs<"plataformas"> = { operacao: "apagar", id };
  await executarGerenciamento("plataformas", p_payload);
}

export async function listCaracteristicas(): Promise<Caracteristica[]> {
  if (isSupabaseEnabled()) {
    try {
      const snapshot = await listConfiguracoesSupabase();
      return snapshot.caracteristicas;
    } catch (error) {
      console.error("Erro ao listar características via Supabase; usando dados mock.", error);
    }
  }

  return listCaracteristicasMock();
}

export async function saveCaracteristica(
  input: EditableEntity<Caracteristica>,
): Promise<Caracteristica> {
  const p_payload = buildSaveArgs<"caracteristicas">(input);
  const result = await executarGerenciamento("caracteristicas", p_payload);
  if (!result) {
    throw new Error("Não foi possível salvar a característica.");
  }
  return result;
}

export async function deleteCaracteristica(id: string): Promise<void> {
  const p_payload: GerenciarArgs<"caracteristicas"> = { operacao: "apagar", id };
  await executarGerenciamento("caracteristicas", p_payload);
}

export async function listModelos(): Promise<Modelo[]> {
  if (isSupabaseEnabled()) {
    try {
      const snapshot = await listConfiguracoesSupabase();
      return snapshot.modelos;
    } catch (error) {
      console.error("Erro ao listar modelos via Supabase; usando dados mock.", error);
    }
  }

  return listModelosMock();
}

export async function saveModelo(input: EditableEntity<Modelo>): Promise<Modelo> {
  const p_payload = buildSaveArgs<"modelos">(input);
  const result = await executarGerenciamento("modelos", p_payload);
  if (!result) {
    throw new Error("Não foi possível salvar o modelo.");
  }
  return result;
}

export async function deleteModelo(id: string): Promise<void> {
  const p_payload: GerenciarArgs<"modelos"> = { operacao: "apagar", id };
  await executarGerenciamento("modelos", p_payload);
}

export async function listLocais(): Promise<Local[]> {
  if (isSupabaseEnabled()) {
    try {
      const snapshot = await listConfiguracoesSupabase();
      return snapshot.locais;
    } catch (error) {
      console.error("Erro ao listar locais via Supabase; usando dados mock.", error);
    }
  }

  return listLocaisMock();
}

export async function saveLocal(input: EditableEntity<Local>): Promise<Local> {
  const p_payload = buildSaveArgs<"locais">(input);
  const result = await executarGerenciamento("locais", p_payload);
  if (!result) {
    throw new Error("Não foi possível salvar o local.");
  }
  return result;
}

export async function deleteLocal(id: string): Promise<void> {
  const p_payload: GerenciarArgs<"locais"> = { operacao: "apagar", id };
  await executarGerenciamento("locais", p_payload);
}
