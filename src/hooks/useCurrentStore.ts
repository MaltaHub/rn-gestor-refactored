// src/stores/useCurrentStore.ts
import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export interface Loja {
  id: string;
  nome: string;
}

interface CurrentStoreState {
  lojas: Loja[];
  selectedLoja: Loja | null;
  loading: boolean;
  error: Error | null;
  setSelectedLoja: (loja: Loja | null) => void;
  fetchLojas: () => Promise<Loja[]>;
  lojaId: string | null;
  lojaNome: string | null;
}

export const useCurrentStore = create<CurrentStoreState>((set, get) => ({
  lojas: [],
  selectedLoja: null,
  loading: false,
  error: null,

  setSelectedLoja: (loja: Loja | null) =>
    set({
      selectedLoja: loja,
      lojaId: loja?.id ?? null,
      lojaNome: loja?.nome ?? null,
    }),

  fetchLojas: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("lojas")
        .select("id, nome")
        .order("nome", { ascending: true });

      if (error) throw error;

      // atualiza o estado
      set({ lojas: data ?? [] });

      return data ?? [];
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Erro desconhecido ao buscar lojas");
      console.error("Erro ao buscar lojas:", error);
      set({ error });

      return [];
    } finally {
      set({ loading: false });
    }
  },

  get lojaId() {
    return get().selectedLoja?.id ?? null;
  },
  get lojaNome() {
    return get().selectedLoja?.nome ?? null;
  },
}));

// Carrega as lojas ao inicializar o estado
useCurrentStore.getState().fetchLojas();