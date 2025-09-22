import { backendModules } from "./index";
import type { DomainKey, OperationKind } from "./types";

export interface BoundaryEntry {
  domain: DomainKey;
  operationId: string;
  label: string;
  kind: OperationKind;
  source: {
    type: string;
    name: string;
    description?: string;
  };
  frontend: {
    file: string;
    surface: string;
  }[];
}

export const boundaryMatrix: BoundaryEntry[] = backendModules.flatMap(({ key, operations }) =>
  Object.values(operations).map(({ id, label, kind, source, frontend }) => ({
    domain: key,
    operationId: id,
    label,
    kind,
    source,
    frontend: frontend.map(({ file, surface }) => ({ file, surface }))
  }))
);
