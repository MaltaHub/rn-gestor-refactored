import { redirect } from "next/navigation";

import { LoginScreen } from "@/components/auth/login-screen";
import { getAuthenticatedSession } from "@/lib/auth/server";
import { authService } from "@/lib/services/domains";

export default async function LoginPage() {
  const session = await getAuthenticatedSession();

  if (session) {
    try {
      const vinculo = await authService.fetchEmpresaDoUsuario();
      redirect(vinculo ? "/app" : "/lobby");
    } catch (error) {
      console.error("[login] Falha ao resolver destino para sessão ativa", error);
      redirect("/app");
    }
  }

  return <LoginScreen />;
}
