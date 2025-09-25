import { ReactNode } from "react";

import { AppShell } from "@/components/navigation/app-shell";
import { getAuthenticatedSession } from "@/lib/auth/server";
import { authService } from "@/lib/services/domains";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAuthenticatedSession();

  if (!session) {
    redirect("/login");
  }

  const vinculo = await authService.fetchEmpresaDoUsuario();

  if (!vinculo) {
    redirect("/lobby");
  }

  return <AppShell>{children}</AppShell>;
}
