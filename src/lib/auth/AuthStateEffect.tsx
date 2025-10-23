"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { requestLogout, isLogoutInProgress } from "@/lib/logout-events";

export function AuthStateEffect() {
  const startLoading = useAuthStore((s) => s.startLoading);
  const finishLoading = useAuthStore((s) => s.finishLoading);
  const initialized = useAuthStore((s) => s.initialized);

  // Inicialização do usuário
  useEffect(() => {
    if (initialized) return;

    let active = true;
    startLoading();

    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Failed to load authenticated user:", error);
          finishLoading(null);
          return;
        }
        finishLoading(data.user ?? null);
      })
      .catch((err) => {
        if (active) {
          console.error("Unexpected error:", err);
          finishLoading(null);
        }
      });

    return () => { active = false; };
  }, [initialized, startLoading, finishLoading]);

  // Escuta de mudanças de estado auth
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      finishLoading(session?.user ?? null);

      if (event === "SIGNED_OUT" && !isLogoutInProgress()) {
        requestLogout({ reason: "forced", redirectTo: "/login" }).catch(console.error);
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [finishLoading]);

  return null;
}
