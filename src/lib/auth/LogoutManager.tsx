"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { subscribeToLogout } from "@/lib/logout-events";
import { handleSupabaseSignOut } from "./supabaseLogout";
import { clearClientState } from "./clearClientState";

export function LogoutManager() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const finishLoading = useAuthStore((s) => s.finishLoading);
  const processing = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToLogout(async (event) => {
      if (processing.current) return;
      processing.current = true;

      try {
        await handleSupabaseSignOut();

        await queryClient.cancelQueries({ type: "all" });
        queryClient.clear();
        queryClient.getMutationCache().clear();

        await clearClientState();
        finishLoading(null);

        router.replace(event.redirectTo ?? "/login");
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        processing.current = false;
      }
    });

    return unsubscribe;
  }, [finishLoading, queryClient, router]);

  return null;
}
