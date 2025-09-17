import { create } from "zustand"

import { supabase } from "@/lib/supabaseClient"

export interface Loja {
  id: string
  nome: string
}

interface CurrentStoreState {
  lojas: Loja[]
  selectedLoja: Loja | null
  loading: boolean
  error: Error | null
  lojaId: string | null
  lojaNome: string | null
  setSelectedLoja: (loja: Loja | null) => void
  fetchLojas: (empresaId?: string | null) => Promise<Loja[]>
}

export const useCurrentStore = create<CurrentStoreState>((set) => ({
  lojas: [],
  selectedLoja: null,
  loading: false,
  error: null,
  lojaId: null,
  lojaNome: null,

  setSelectedLoja: (loja) =>
    set({
      selectedLoja: loja,
      lojaId: loja?.id ?? null,
      lojaNome: loja?.nome ?? null,
    }),

  fetchLojas: async (empresaId) => {
    set({ loading: true, error: null })

    try {
      let query = supabase.from("lojas").select("id, nome")

      if (empresaId) {
        query = query.eq("empresa_id", empresaId)
      }

      const { data, error } = await query.order("nome", { ascending: true })

      if (error) throw error

      const lojas = data ?? []

      set((state) => {
        const stillSelected =
          state.selectedLoja && lojas.some((loja) => loja.id === state.selectedLoja?.id)

        return {
          lojas,
          selectedLoja: stillSelected ? state.selectedLoja : null,
          lojaId: stillSelected ? state.selectedLoja?.id ?? null : null,
          lojaNome: stillSelected ? state.selectedLoja?.nome ?? null : null,
        }
      })

      return lojas
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error("Erro ao buscar lojas")
      console.error("Erro ao buscar lojas:", normalized)
      set({ error: normalized, lojas: [], selectedLoja: null, lojaId: null, lojaNome: null })
      return []
    } finally {
      set({ loading: false })
    }
  },
}))

void useCurrentStore.getState().fetchLojas()
