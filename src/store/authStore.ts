import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient.ts'
import { Auth } from '../types'

// Definição do estado e ações da store de autenticação
type AuthState = Auth.AuthState

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,

  // Faz uma leitura inicial da sessão e inicia o listener para atualizações (refresh do token, login/logout)
  bootstrap: async () => {
    set({ loading: true })

    const { data } = await supabase.auth.getSession()
    const session = data.session

    set({
      user: session ? ({ id: session.user.id, email: session.user.email ?? undefined }) : null,
      token: session?.access_token ?? null,
      loading: false,
    })

    // Listener: sempre que o Supabase renovar/alterar a sessão, atualizamos o token em memória
    supabase.auth.onAuthStateChange((_event, newSession) => {
      set({
        user: newSession ? ({ id: newSession.user.id, email: newSession.user.email ?? undefined }) : null,
        token: newSession?.access_token ?? null,
        // não travar a UI; bootstrap já definiu loading=false
      })
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, token: null })
  },
}))