<<<<<<< HEAD
﻿import { create } from "zustand";
=======
import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient.ts'
import { Auth } from '../types'

// Definição do estado e ações da store de autenticação
type AuthState = Auth.AuthState
>>>>>>> 4a9cd9a764550d3359743d5484686b69da2b76a3

import { supabase } from "@/lib/supabaseClient";
import type { AuthState } from "@/types";

export const useAuthStore = create<AuthState>((set) => {
  const refreshEmpresaId = async () => {
    try {
      const { data, error } = await supabase.rpc("empresa_do_usuario");
      if (error) throw error;
      set({ empresaId: data ?? null });
    } catch (erro) {
      console.error("Falha ao obter empresa do usuario", erro);
      set({ empresaId: null });
    }
  };

  return {
    user: null,
    token: null,
    empresaId: null,
    loading: true,
    bootstrap: async () => {
      set({ loading: true });

      const { data } = await supabase.auth.getSession();
      const session = data.session;

      set({
        user: session
          ? {
              id: session.user.id,
              email: session.user.email ?? undefined,
            }
          : null,
        token: session?.access_token ?? null,
        loading: false,
      });

      if (session) {
        await refreshEmpresaId();
      }

      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        set({
          user: newSession
            ? {
                id: newSession.user.id,
                email: newSession.user.email ?? undefined,
              }
            : null,
          token: newSession?.access_token ?? null,
        });

        if (newSession) {
          await refreshEmpresaId();
        } else {
          set({ empresaId: null });
        }
      });
    },
    setEmpresaId: (empresaId: string | null) => set({ empresaId }),
    refreshEmpresa: refreshEmpresaId,
    logout: async () => {
      await supabase.auth.signOut();
      set({ user: null, token: null, empresaId: null });
    },
  };
});
