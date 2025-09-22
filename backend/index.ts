import type { BackendOperation, DomainModule, OperationRegistry } from "./types";
import { authOperations } from "./modules/auth";
import { configuracoesOperations } from "./modules/configuracoes";
import { dashboardOperations } from "./modules/dashboard";
import { estoqueOperations } from "./modules/estoque";
import { anunciosOperations } from "./modules/anuncios";
import { promocoesOperations } from "./modules/promocoes";
import { perfilOperations } from "./modules/perfil";
import { vendasOperations } from "./modules/vendas";

export const backendModules: DomainModule[] = [
  { key: "dashboard", summary: "Cockpit com visão executiva", operations: dashboardOperations },
  { key: "estoque", summary: "Gestão de veículos e status de venda", operations: estoqueOperations },
  { key: "anuncios", summary: "Governança das plataformas de anúncio", operations: anunciosOperations },
  { key: "vendas", summary: "Pipeline comercial e execução", operations: vendasOperations },
  { key: "promocoes", summary: "Campanhas comerciais e incentivos", operations: promocoesOperations },
  { key: "perfil", summary: "Dados pessoais e segurança", operations: perfilOperations },
  { key: "configuracoes", summary: "Cadastros base para lojas, plataformas e modelos", operations: configuracoesOperations },
  { key: "auth", summary: "Autenticação e sessão", operations: authOperations }
];

export const backendOperations: OperationRegistry = backendModules.reduce<OperationRegistry>((registry, module) => {
  registry[module.key] = module.operations;
  return registry;
}, {} as OperationRegistry);

export const operationList: BackendOperation[] = backendModules.flatMap((module) =>
  Object.values(module.operations)
);

export function findOperation(id: string): BackendOperation | undefined {
  return operationList.find((operation) => operation.id === id);
}

export type { BackendOperation, DomainModule } from "./types";
