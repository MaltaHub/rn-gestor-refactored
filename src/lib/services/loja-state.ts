export type LojaListener = (lojaId: string | null) => void;

let globalLojaAtual: string | null = null;
const listeners = new Set<LojaListener>();

export function getGlobalLoja(): string | null {
  return globalLojaAtual;
}

export function setGlobalLoja(lojaId: string | null): void {
  if (globalLojaAtual === lojaId) {
    return;
  }
  globalLojaAtual = lojaId;
  listeners.forEach((listener) => {
    try {
      listener(globalLojaAtual);
    } catch (error) {
      console.error("Falha ao notificar listener de loja", error);
    }
  });
}

export function subscribeToGlobalLoja(listener: LojaListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function withLojaOverride<T>(lojaId: string, fn: () => T): T {
  const previous = globalLojaAtual;
  try {
    globalLojaAtual = lojaId;
    return fn();
  } finally {
    globalLojaAtual = previous;
  }
}
