'use client';

import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

type AuthStore = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  startLoading: () => void;
  finishLoading: (user: User | null) => void;
  setUser: (user: User | null) => void;
  reset: () => void;
};

const initialState = {
  user: null,
  loading: true,
  initialized: false,
} satisfies Pick<AuthStore, 'user' | 'loading' | 'initialized'>;

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  startLoading: () => set({ loading: true }),
  finishLoading: (user) => set({ user, loading: false, initialized: true }),
  setUser: (user) =>
    set((state) => ({
      user,
      loading: false,
      initialized: state.initialized || user !== null,
    })),
  reset: () => set(initialState),
}));

