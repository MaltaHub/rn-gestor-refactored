import type { BackendOperation, OperationGroup } from "../types";
import { registerOperationGroup } from "../utils/operation-stub";

export const signInWithPassword: BackendOperation<{ email: string; password: string }, { access_token: string }> = {
  id: "auth.signInWithPassword",
  label: "Autenticação por email",
  domain: "auth",
  kind: "command",
  source: {
    type: "auth",
    name: "supabase.auth.signInWithPassword",
    description: "Fluxo padrão de login com email e senha"
  },
  frontend: [{ file: "app/(site)/login/page.tsx", surface: "Formulário de login" }],
  mock: async ({ email }) => ({ access_token: `mock-token-for-${email}` })
};

export const signOut: BackendOperation<Record<string, never>, { signed_out: boolean }> = {
  id: "auth.signOut",
  label: "Encerrar sessão",
  domain: "auth",
  kind: "command",
  source: {
    type: "auth",
    name: "supabase.auth.signOut",
    description: "Limpa sessão atual do usuário"
  },
  frontend: [{ file: "components/navigation/app-shell.tsx", surface: "Menu usuário" }],
  mock: async () => ({ signed_out: true })
};

export const authOperations: OperationGroup = registerOperationGroup({
  signInWithPassword,
  signOut
});
