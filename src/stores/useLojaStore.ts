import { create } from "zustand";
import { persist, createJSONStorage, type PersistStorage } from "zustand/middleware";
import { Loja } from "@/types";

interface LojaState {
  lojaSelecionada: Loja | null;
  setLojaSelecionada: (loja: Loja) => void;
}

// ✅ Sempre retorna um storage válido (mesmo no SSR)
const storage: PersistStorage<{ lojaSelecionada: Loja | null }> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  },
};

export const useLojaStore = create<LojaState>()(
  persist(
    (set) => ({
      lojaSelecionada: null,
      setLojaSelecionada: (loja) => set({ lojaSelecionada: loja }),
    }),
    {
      name: "vitrine:loja-selecionada",
      storage,
      partialize: (state) => ({ lojaSelecionada: state.lojaSelecionada }),
    }
  )
);
