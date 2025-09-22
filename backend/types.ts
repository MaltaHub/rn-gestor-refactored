import type { ModuleSlug } from "@/data/modules";

export type DomainKey = ModuleSlug | "auth" | "dashboard" | "shared";

export type OperationKind = "query" | "command";

export type SourceType = "table" | "view" | "rpc" | "auth";

export interface OperationSource {
  type: SourceType;
  name: string;
  description?: string;
}

export interface FrontReference {
  file: string;
  surface: string;
  notes?: string;
}

export interface ExecutionContext {
  client?: unknown;
}

export interface BackendOperation<Args = unknown, Result = unknown> {
  id: string;
  label: string;
  domain: DomainKey;
  kind: OperationKind;
  source: OperationSource;
  frontend: FrontReference[];
  run?: (args: Args, context?: ExecutionContext) => Promise<Result>;
  mock: (args: Args) => Promise<Result>;
}

export type OperationGroup = Record<string, BackendOperation<any, any>>;

export interface DomainModule {
  key: DomainKey;
  summary: string;
  operations: OperationGroup;
}

export type OperationRegistry = Record<DomainKey, OperationGroup>;
