import type { BackendOperation, OperationGroup } from "../types";

function logNotImplemented(operation: BackendOperation<any, any>) {
  // Surface whenever a frontend call reaches an unfinished backend handler.
  console.warn(`[backend] Operação ${operation.id} ainda não foi desenvolvida. Retornando dados mock.`);
}

export function markOperationAsNotImplemented<Args, Result>(operation: BackendOperation<Args, Result>) {
  const originalMock = operation.mock.bind(operation);

  const stub = async (args: Args) => {
    logNotImplemented(operation);
    return await originalMock(args);
  };

  operation.run = stub;
  operation.mock = stub;

  return operation;
}

export function registerOperationGroup<T extends OperationGroup>(group: T): T {
  Object.values(group).forEach((operation) => {
    markOperationAsNotImplemented(operation);
  });
  return group;
}
