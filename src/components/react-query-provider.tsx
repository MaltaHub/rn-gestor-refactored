'use client';

import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { requestLogout, subscribeToLogout, isLogoutInProgress } from "@/lib/logout-events";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";

export function ReactQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthStateEffect />
      <LogoutEffect />
      {children}
    </QueryClientProvider>
  );
}

function AuthStateEffect() {
  const startLoading = useAuthStore((state) => state.startLoading);
  const finishLoading = useAuthStore((state) => state.finishLoading);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    if (initialized) {
      return;
    }

    let active = true;
    startLoading();

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          console.error("Failed to load authenticated user", error);
          finishLoading(null);
          return;
        }

        finishLoading(data.user ?? null);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Unexpected error while loading authenticated user", error);
        finishLoading(null);
      });

    return () => {
      active = false;
    };
  }, [initialized, startLoading, finishLoading]);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      finishLoading(session?.user ?? null);

      if (event === "SIGNED_OUT" && !isLogoutInProgress()) {
        requestLogout({ reason: "forced", redirectTo: "/login" }).catch((error) => {
          console.error("Failed to process SIGNED_OUT event", error);
        });
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [finishLoading]);

  return null;
}

function LogoutEffect() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const processingRef = useRef(false);
  const finishLoading = useAuthStore((state) => state.finishLoading);

  useEffect(() => {
    const unsubscribe = subscribeToLogout(async (event) => {
      if (processingRef.current) {
        return;
      }

      processingRef.current = true;

      try {
        try {
          await handleSupabaseSignOut();
        } catch (error) {
          console.error("Failed to sign out from Supabase", error);
        }

        try {
          await queryClient.cancelQueries({ type: "all" });
        } catch (error) {
          console.error("Failed to cancel active React Query queries", error);
        } finally {
          queryClient.getMutationCache().clear();
          queryClient.clear();
        }

        await clearClientState();
        finishLoading(null);

        const redirectPath = event.redirectTo ?? "/login";
        router.replace(redirectPath);
      } finally {
        processingRef.current = false;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [finishLoading, queryClient, router]);

  return null;
}

async function handleSupabaseSignOut() {
  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch (error) {
    const status = typeof error === "object" && error !== null ? (error as { status?: number }).status : undefined;

    if (status === 401) {
      // Session already invalidated; nothing else to do.
      return;
    }

    throw error;
  }
}

async function clearClientState() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.warn("Failed to clear localStorage during logout", error);
    }

    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.warn("Failed to clear sessionStorage during logout", error);
    }

    const cacheStorage = window.caches;
    if (cacheStorage) {
      try {
        const cacheKeys = await cacheStorage.keys();
        await Promise.all(cacheKeys.map((key) => cacheStorage.delete(key)));
      } catch (error) {
        console.warn("Failed to clear Cache Storage during logout", error);
      }
    }
  }

  if (typeof document !== "undefined") {
    const cookies = document.cookie ? document.cookie.split(";") : [];
    for (const cookie of cookies) {
      const eqPosition = cookie.indexOf("=");
      const name = eqPosition > -1 ? cookie.slice(0, eqPosition) : cookie;
      const trimmed = name.trim();

      if (!trimmed) continue;

      if (shouldClearCookie(trimmed)) {
        document.cookie = `${trimmed}=;expires=${new Date(0).toUTCString()};path=/`;
      }
    }
  }
}

function shouldClearCookie(name: string) {
  // Supabase stores sessions in cookies that start with "sb-<project id>".
  // Keep other cookies (e.g. GitHub Codespaces port-forward auth) intact to avoid CORS issues.
  return name.startsWith("sb-") || name.toLowerCase().includes("supabase");
}
