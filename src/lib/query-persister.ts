import type {
  Persister,
  PersistedClient,
} from "@tanstack/query-persist-client-core";

const CACHE_KEY = "REACT_QUERY_CACHE";
const CACHE_BUSTER = "v1.0.0";

// Persister compatível com TanStack Query v5
export const localStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    if (typeof window === "undefined") return;
    try {
      const withBuster = { ...client, buster: CACHE_BUSTER };
      localStorage.setItem(CACHE_KEY, JSON.stringify(withBuster));
    } catch (error) {
      console.error("Failed to persist query cache:", error);
    }
  },

  restoreClient: async (): Promise<PersistedClient | undefined> => {
    if (typeof window === "undefined") return undefined;
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      if (!cache) return undefined;

      type PersistedClientWithBuster = PersistedClient & { buster?: string };
      const parsed = JSON.parse(cache) as PersistedClientWithBuster;
      if (parsed.buster !== CACHE_BUSTER) {
        localStorage.removeItem(CACHE_KEY);
        return undefined;
      }

      return parsed;
    } catch (error) {
      console.error("Failed to restore query cache:", error);
      return undefined;
    }
  },

  removeClient: async () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Failed to remove query cache:", error);
    }
  },
};
