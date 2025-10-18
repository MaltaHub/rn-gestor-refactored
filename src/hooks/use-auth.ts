import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/stores/useAuthStore";

export function useAuth() {
  const { user, loading, initialized } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      loading: state.loading,
      initialized: state.initialized,
    }))
  );

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  return { user, loading, initialized, isAuthenticated };
}
