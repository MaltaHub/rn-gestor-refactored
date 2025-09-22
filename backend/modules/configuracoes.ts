import type { BackendOperation, OperationGroup } from "../types";
import type {
  CharacteristicRecord,
  LocationRecord,
  ModelRecord,
  PlatformRecord,
  StoreRecord
} from "../fixtures";
import {
  characteristicRecords,
  locationRecords,
  modelRecords,
  platformRecords,
  storeRecords
} from "../fixtures";
import { registerOperationGroup } from "../utils/operation-stub";

function filterByCompany<T extends { empresa_id: string }>(records: T[], empresaId?: string) {
  return empresaId ? records.filter((record) => record.empresa_id === empresaId) : records;
}

function mockId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${random}`;
}

export interface SimpleCreateInput {
  empresa_id: string;
  nome: string;
}

export interface SimpleUpdateInput {
  empresa_id: string;
  id: string;
  nome: string;
}

export interface DeleteInput {
  empresa_id: string;
  id: string;
}

export interface CreateModelInput extends Omit<ModelRecord, "id"> {}

export interface UpdateModelInput extends Partial<Omit<ModelRecord, "empresa_id">> {
  empresa_id: string;
  id: string;
}

export const listStores: BackendOperation<{ empresa_id?: string }, StoreRecord[]> = {
  id: "configuracoes.listStores",
  label: "Listar lojas",
  domain: "configuracoes",
  kind: "query",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_lojas",
    description: "Executa a operação 'listar' na procedure rpc_gerenciar_lojas"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Sessao de lojas" }],
  mock: async ({ empresa_id } = {}) => filterByCompany(storeRecords, empresa_id)
};

export const createStore: BackendOperation<SimpleCreateInput, { id: string }> = {
  id: "configuracoes.createStore",
  label: "Criar loja",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_lojas",
    description: "Envia p_operacao = 'criar' para inserir uma nova loja"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Botao Criar loja" }],
  mock: async () => ({ id: mockId("store") })
};

export const updateStore: BackendOperation<SimpleUpdateInput, { id: string }> = {
  id: "configuracoes.updateStore",
  label: "Atualizar loja",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_lojas",
    description: "Envia p_operacao = 'atualizar' para alterar dados da loja"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Editar loja" }],
  mock: async ({ id }) => ({ id })
};

export const deleteStore: BackendOperation<DeleteInput, { sucesso: boolean; id: string }> = {
  id: "configuracoes.deleteStore",
  label: "Apagar loja",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_lojas",
    description: "Envia p_operacao = 'apagar' para remover a loja"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Remover loja" }],
  mock: async ({ id }) => ({ sucesso: true, id })
};

export const listCharacteristics: BackendOperation<{ empresa_id?: string }, CharacteristicRecord[]> = {
  id: "configuracoes.listCharacteristics",
  label: "Listar caracteristicas",
  domain: "configuracoes",
  kind: "query",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_caracteristicas",
    description: "Executa a operação 'listar' na procedure rpc_gerenciar_caracteristicas"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Sessao de caracteristicas" }],
  mock: async ({ empresa_id } = {}) => filterByCompany(characteristicRecords, empresa_id)
};

export const createCharacteristic: BackendOperation<SimpleCreateInput, { id: string }> = {
  id: "configuracoes.createCharacteristic",
  label: "Criar caracteristica",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_caracteristicas",
    description: "Envia p_operacao = 'criar' para inserir uma caracteristica"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Botao Criar caracteristica" }],
  mock: async () => ({ id: mockId("char") })
};

export const updateCharacteristic: BackendOperation<SimpleUpdateInput, { id: string }> = {
  id: "configuracoes.updateCharacteristic",
  label: "Atualizar caracteristica",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_caracteristicas",
    description: "Envia p_operacao = 'atualizar' para alterar uma caracteristica"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Editar caracteristica" }],
  mock: async ({ id }) => ({ id })
};

export const deleteCharacteristic: BackendOperation<DeleteInput, { sucesso: boolean; id: string }> = {
  id: "configuracoes.deleteCharacteristic",
  label: "Apagar caracteristica",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_caracteristicas",
    description: "Envia p_operacao = 'apagar' para remover uma caracteristica"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Remover caracteristica" }],
  mock: async ({ id }) => ({ sucesso: true, id })
};

export const listPlatforms: BackendOperation<{ empresa_id?: string }, PlatformRecord[]> = {
  id: "configuracoes.listPlatforms",
  label: "Listar plataformas",
  domain: "configuracoes",
  kind: "query",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_plataformas",
    description: "Executa a operação 'listar' na procedure rpc_gerenciar_plataformas"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Sessao de plataformas" }],
  mock: async ({ empresa_id } = {}) => filterByCompany(platformRecords, empresa_id)
};

export const createPlatform: BackendOperation<SimpleCreateInput, { id: string }> = {
  id: "configuracoes.createPlatform",
  label: "Criar plataforma",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_plataformas",
    description: "Envia p_operacao = 'criar' para inserir uma plataforma"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Botao Criar plataforma" }],
  mock: async () => ({ id: mockId("plat") })
};

export const updatePlatform: BackendOperation<SimpleUpdateInput, { id: string }> = {
  id: "configuracoes.updatePlatform",
  label: "Atualizar plataforma",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_plataformas",
    description: "Envia p_operacao = 'atualizar' para alterar uma plataforma"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Editar plataforma" }],
  mock: async ({ id }) => ({ id })
};

export const deletePlatform: BackendOperation<DeleteInput, { sucesso: boolean; id: string }> = {
  id: "configuracoes.deletePlatform",
  label: "Apagar plataforma",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_plataformas",
    description: "Envia p_operacao = 'apagar' para remover uma plataforma"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Remover plataforma" }],
  mock: async ({ id }) => ({ sucesso: true, id })
};

export const listLocations: BackendOperation<{ empresa_id?: string }, LocationRecord[]> = {
  id: "configuracoes.listLocations",
  label: "Listar locais",
  domain: "configuracoes",
  kind: "query",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_locais",
    description: "Executa a operação 'listar' na procedure rpc_gerenciar_locais"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Sessao de locais" }],
  mock: async ({ empresa_id } = {}) => filterByCompany(locationRecords, empresa_id)
};

export const createLocation: BackendOperation<SimpleCreateInput, { id: string }> = {
  id: "configuracoes.createLocation",
  label: "Criar local",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_locais",
    description: "Envia p_operacao = 'criar' para inserir um novo local"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Botao Criar local" }],
  mock: async () => ({ id: mockId("loc") })
};

export const updateLocation: BackendOperation<SimpleUpdateInput, { id: string }> = {
  id: "configuracoes.updateLocation",
  label: "Atualizar local",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_locais",
    description: "Envia p_operacao = 'atualizar' para alterar um local"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Editar local" }],
  mock: async ({ id }) => ({ id })
};

export const deleteLocation: BackendOperation<DeleteInput, { sucesso: boolean; id: string }> = {
  id: "configuracoes.deleteLocation",
  label: "Apagar local",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_locais",
    description: "Envia p_operacao = 'apagar' para remover um local"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Remover local" }],
  mock: async ({ id }) => ({ sucesso: true, id })
};

export const listModels: BackendOperation<{ empresa_id?: string }, ModelRecord[]> = {
  id: "configuracoes.listModels",
  label: "Listar modelos",
  domain: "configuracoes",
  kind: "query",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_modelos",
    description: "Executa a operação 'listar' na procedure rpc_gerenciar_modelos"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Sessao de modelos" }],
  mock: async ({ empresa_id } = {}) => filterByCompany(modelRecords, empresa_id)
};

export const createModel: BackendOperation<CreateModelInput, { id: string }> = {
  id: "configuracoes.createModel",
  label: "Criar modelo",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_modelos",
    description: "Envia p_operacao = 'criar' para inserir um modelo"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Botao Criar modelo" }],
  mock: async () => ({ id: mockId("model") })
};

export const updateModel: BackendOperation<UpdateModelInput, { id: string }> = {
  id: "configuracoes.updateModel",
  label: "Atualizar modelo",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_modelos",
    description: "Envia p_operacao = 'atualizar' para alterar um modelo"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Editar modelo" }],
  mock: async ({ id }) => ({ id })
};

export const deleteModel: BackendOperation<DeleteInput, { sucesso: boolean; id: string }> = {
  id: "configuracoes.deleteModel",
  label: "Apagar modelo",
  domain: "configuracoes",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_modelos",
    description: "Envia p_operacao = 'apagar' para remover um modelo"
  },
  frontend: [{ file: "app/app/configuracoes/page.tsx", surface: "Acao Remover modelo" }],
  mock: async ({ id }) => ({ sucesso: true, id })
};

export const configuracoesOperations: OperationGroup = registerOperationGroup({
  listStores,
  createStore,
  updateStore,
  deleteStore,
  listCharacteristics,
  createCharacteristic,
  updateCharacteristic,
  deleteCharacteristic,
  listPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  listModels,
  createModel,
  updateModel,
  deleteModel
});
