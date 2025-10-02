// stores/useLojaStore.ts
import { create } from "zustand";

import { Loja } from "@/types";

interface LojaState {
  lojaSelecionada: Loja | null;
  setLojaSelecionada: (loja: Loja) => void;
}

export const useLojaStore = create<LojaState>((set) => ({
  lojaSelecionada: null,
  setLojaSelecionada: (loja) => set({ lojaSelecionada: loja }),
}));
