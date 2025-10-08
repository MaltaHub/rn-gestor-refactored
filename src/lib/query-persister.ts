/**
 * Query Persister
 * Persistência de cache do React Query no localStorage
 */

interface PersistedClient {
  timestamp: number;
  buster: string;
  clientState: any;
}

interface Persister {
  persistClient: (client: PersistedClient) => Promise<void>;
  restoreClient: () => Promise<PersistedClient | undefined>;
  removeClient: () => Promise<void>;
}

export const localStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('REACT_QUERY_CACHE', JSON.stringify(client));
    } catch (error) {
      console.error('Failed to persist query cache:', error);
    }
  },
  restoreClient: async () => {
    if (typeof window === 'undefined') return undefined;
    try {
      const cache = localStorage.getItem('REACT_QUERY_CACHE');
      return cache ? JSON.parse(cache) : undefined;
    } catch (error) {
      console.error('Failed to restore query cache:', error);
      return undefined;
    }
  },
  removeClient: async () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('REACT_QUERY_CACHE');
    } catch (error) {
      console.error('Failed to remove query cache:', error);
    }
  },
};

export function createQueryClientPersister() {
  return localStoragePersister;
}
