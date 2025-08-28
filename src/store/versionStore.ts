import { create } from "zustand";

export interface VersionState {
  versions: Record<string, number>;
  updateVersion: (queryKey: string) => void;
}

export const useVersionStore = create<VersionState>((set) => ({
  versions: {
    todos: 1,
    users: 1,
  },
  updateVersion: (queryKey: string) =>
    set((state) => ({
      versions: {
        ...state.versions,
        [queryKey]: (state.versions[queryKey] || 0) + 1,
      },
    })),
}));
