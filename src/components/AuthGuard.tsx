// src/components/AuthGuard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <p>Carregando...</p>;

  if (!user) {
    router.push("/login");
    return null;
  }

  return <>{children}</>;
}
