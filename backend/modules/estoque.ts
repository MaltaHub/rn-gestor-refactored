import type { BackendOperation, OperationGroup } from "../types";
import type { InventoryVehicle } from "../fixtures";
import { inventoryVehicles } from "../fixtures";
import { registerOperationGroup } from "../utils/operation-stub";

export interface ListInventoryArgs {
  search?: string;
  lojaId?: string;
}

export interface UpsertVehicleInput {
  id?: string;
  placa: string;
  modelo_id?: string;
  estado_venda: string;
  preco_venal?: number | null;
  loja_id?: string | null;
}

export interface UpdateVehicleStatusInput {
  veiculo_id: string;
  estado_venda: string;
}

export const listVehicles: BackendOperation<ListInventoryArgs, InventoryVehicle[]> = {
  id: "estoque.listVehicles",
  label: "Listar veículos",
  domain: "estoque",
  kind: "query",
  source: {
    type: "table",
    name: "veiculos",
    description: "SELECT v.*, m.nome AS modelo_nome, l.nome AS loja_nome FROM veiculos v LEFT JOIN modelos m ON m.id = v.modelo_id LEFT JOIN veiculos_loja vl ON vl.veiculo_id = v.id LEFT JOIN lojas l ON l.id = vl.loja_id"
  },
  frontend: [
    { file: "app/app/estoque/page.tsx", surface: "Grid de veículos" },
    { file: "app/app/page.tsx", surface: "Lista de últimos veículos" }
  ],
  mock: async ({ search, lojaId }: ListInventoryArgs = {}) => {
    const query = search?.trim().toLowerCase();
    return inventoryVehicles.filter((vehicle) => {
      const matchesSearch = query
        ? vehicle.placa.toLowerCase().includes(query) || vehicle.modelo_nome.toLowerCase().includes(query)
        : true;
      const matchesStore = lojaId ? vehicle.loja_id === lojaId : true;
      return matchesSearch && matchesStore;
    });
  }
};

export const getVehicleByPlate: BackendOperation<{ placa: string }, InventoryVehicle | null> = {
  id: "estoque.getVehicleByPlate",
  label: "Buscar veículo pela placa",
  domain: "estoque",
  kind: "query",
  source: {
    type: "table",
    name: "veiculos",
    description: "SELECT v.*, m.nome AS modelo_nome FROM veiculos v LEFT JOIN modelos m ON m.id = v.modelo_id WHERE v.placa = :placa"
  },
  frontend: [{ file: "app/app/estoque/page.tsx", surface: "Botão Detalhes" }],
  mock: async ({ placa }) => inventoryVehicles.find((vehicle) => vehicle.placa === placa) ?? null
};

export const saveVehicle: BackendOperation<UpsertVehicleInput, { id: string }> = {
  id: "estoque.saveVehicle",
  label: "Criar ou editar veículo",
  domain: "estoque",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_veiculos",
    description: "RPC para criar/atualizar veículos e relacionamentos com lojas"
  },
  frontend: [
    { file: "app/app/estoque/page.tsx", surface: "Botão Novo veículo" },
    { file: "app/app/page.tsx", surface: "Ação Novo veículo no dashboard" }
  ],
  mock: async (input) => ({ id: input.id ?? "veh-mock" })
};

export const updateVehicleStatus: BackendOperation<UpdateVehicleStatusInput, { veiculo_id: string; estado_venda: string }> = {
  id: "estoque.updateVehicleStatus",
  label: "Atualizar status de venda",
  domain: "estoque",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_gerenciar_veiculos",
    description: "RPC para atualizar status do veículo"
  },
  frontend: [{ file: "app/app/estoque/page.tsx", surface: "Fluxo de alteração de status" }],
  mock: async ({ veiculo_id, estado_venda }) => ({ veiculo_id, estado_venda })
};

export const estoqueOperations: OperationGroup = registerOperationGroup({
  listVehicles,
  getVehicleByPlate,
  saveVehicle,
  updateVehicleStatus
});
