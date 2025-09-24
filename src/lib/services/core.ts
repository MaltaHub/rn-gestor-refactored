import { getGlobalLoja } from "./loja-state";
import {
  readOperationMetadata,
  type ReadParams,
  type ReadResource,
  type ReadResult,
  writeOperationMetadata,
  type WritePayload,
  type WriteResource,
  type WriteResult
} from "./operations";
import type { ReadHandler, RequestScope, WriteHandler } from "./types";
import { getReadMock, getWriteMock } from "./mocks";

type AnyReadHandler = ReadHandler<ReadResource>;
type AnyWriteHandler = WriteHandler<WriteResource>;

const readHandlers = new Map<ReadResource, AnyReadHandler>();
const writeHandlers = new Map<WriteResource, AnyWriteHandler>();

function resolveScopeForRead(resource: ReadResource, scope?: RequestScope): RequestScope {
  const metadata = readOperationMetadata[resource];
  const effective: RequestScope = { ...(scope ?? {}) };

  if (metadata?.requiresLoja && !effective.loja) {
    const globalLoja = getGlobalLoja();
    if (globalLoja) {
      effective.loja = globalLoja;
      effective.origem = effective.origem ?? "global";
    } else {
      console.warn(
        `[readClient] Operação "${resource}" requer LojaAtual, mas nenhuma foi definida. Considere acionar setGlobalLoja.`
      );
    }
  }

  return effective;
}

function resolveScopeForWrite(resource: WriteResource, scope?: RequestScope): RequestScope {
  const metadata = writeOperationMetadata[resource];
  const effective: RequestScope = { ...(scope ?? {}) };

  if (metadata?.requiresLoja && !effective.loja) {
    const globalLoja = getGlobalLoja();
    if (globalLoja) {
      effective.loja = globalLoja;
      effective.origem = effective.origem ?? "global";
    } else {
      console.warn(
        `[writeClient] Operação "${resource}" requer LojaAtual, mas nenhuma foi definida. Considere acionar setGlobalLoja.`
      );
    }
  }

  return effective;
}

async function executeRead<Resource extends ReadResource>(
  resource: Resource,
  params: ReadParams<Resource> | undefined,
  scope?: RequestScope
): Promise<ReadResult<Resource>> {
  const effectiveScope = resolveScopeForRead(resource, scope);
  const handler = readHandlers.get(resource) as ReadHandler<Resource> | undefined;
  const normalizedParams = params ?? ({} as ReadParams<Resource>);

  if (handler) {
    return handler(normalizedParams, effectiveScope);
  }

  const mock = getReadMock(resource);
  if (mock) {
    console.warn(`[readClient] Usando dado mock para "${resource}" até que a integração seja implementada.`);
    return mock(normalizedParams, effectiveScope);
  }

  console.warn(`[readClient] Nenhum handler ou mock definido para "${resource}". Retornando undefined.`);
  return undefined as unknown as ReadResult<Resource>;
}

async function executeWrite<Resource extends WriteResource>(
  resource: Resource,
  payload: WritePayload<Resource>,
  scope?: RequestScope
): Promise<WriteResult<Resource>> {
  const effectiveScope = resolveScopeForWrite(resource, scope);
  const handler = writeHandlers.get(resource) as WriteHandler<Resource> | undefined;

  if (handler) {
    return handler(payload, effectiveScope);
  }

  const mock = getWriteMock(resource);
  if (mock) {
    console.warn(`[writeClient] Usando mock handler para "${resource}" até que a integração seja implementada.`);
    return mock(payload, effectiveScope);
  }

  console.warn(`[writeClient] Nenhum handler ou mock definido para "${resource}". Retornando resultado vazio.`);
  return undefined as unknown as WriteResult<Resource>;
}

export const readClient = {
  async fetch<Resource extends ReadResource>(
    resource: Resource,
    params?: ReadParams<Resource>,
    scope?: RequestScope
  ): Promise<ReadResult<Resource>> {
    return executeRead(resource, params, scope);
  },
  register<Resource extends ReadResource>(resource: Resource, handler: ReadHandler<Resource>) {
    readHandlers.set(resource, handler as unknown as AnyReadHandler);
  },
  unregister(resource: ReadResource) {
    readHandlers.delete(resource);
  }
};

export const writeClient = {
  async execute<Resource extends WriteResource>(
    resource: Resource,
    payload: WritePayload<Resource>,
    scope?: RequestScope
  ): Promise<WriteResult<Resource>> {
    return executeWrite(resource, payload, scope);
  },
  register<Resource extends WriteResource>(resource: Resource, handler: WriteHandler<Resource>) {
    writeHandlers.set(resource, handler as unknown as AnyWriteHandler);
  },
  unregister(resource: WriteResource) {
    writeHandlers.delete(resource);
  }
};

export type { RequestScope } from "./types";
export { setGlobalLoja, subscribeToGlobalLoja, withLojaOverride, getGlobalLoja } from "./loja-state";

export function scopeFromLoja(lojaId?: string | null): RequestScope | undefined {
  if (!lojaId) {
    return undefined;
  }
  return { loja: lojaId, origem: "manual" };
}
