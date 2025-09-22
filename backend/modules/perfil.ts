import type { BackendOperation, OperationGroup } from "../types";
import type { PreferenceRecord, ProfileRecord } from "../fixtures";
import { preferenceRecord, profileRecord } from "../fixtures";
import { registerOperationGroup } from "../utils/operation-stub";

export const getProfile: BackendOperation<{ usuario_id?: string }, ProfileRecord> = {
  id: "perfil.getProfile",
  label: "Perfil do usuário",
  domain: "perfil",
  kind: "query",
  source: {
    type: "view",
    name: "usuarios_perfis",
    description: "SELECT * FROM usuarios_perfis WHERE usuario_id = auth.uid()"
  },
  frontend: [{ file: "app/app/perfil/page.tsx", surface: "Formulário de dados básicos" }],
  mock: async () => profileRecord
};

export const updateProfile: BackendOperation<ProfileRecord, { atualizado: boolean }> = {
  id: "perfil.updateProfile",
  label: "Atualizar perfil",
  domain: "perfil",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_atualizar_perfil",
    description: "Atualiza dados em usuarios_perfis com auditoria"
  },
  frontend: [{ file: "app/app/perfil/page.tsx", surface: "Botão Salvar alterações" }],
  mock: async () => ({ atualizado: true })
};

export const getPreferences: BackendOperation<Record<string, never>, PreferenceRecord> = {
  id: "perfil.getPreferences",
  label: "Preferências pessoais",
  domain: "perfil",
  kind: "query",
  source: {
    type: "view",
    name: "usuarios_preferencias",
    description: "SELECT * FROM usuarios_preferencias WHERE usuario_id = auth.uid()"
  },
  frontend: [{ file: "app/app/perfil/page.tsx", surface: "Preferências rápidas" }],
  mock: async () => preferenceRecord
};

export const updatePreferences: BackendOperation<PreferenceRecord, { atualizado: boolean }> = {
  id: "perfil.updatePreferences",
  label: "Atualizar preferências",
  domain: "perfil",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_atualizar_preferencias",
    description: "Atualiza flags em usuarios_preferencias"
  },
  frontend: [{ file: "app/app/perfil/page.tsx", surface: "Botão Salvar alterações" }],
  mock: async () => ({ atualizado: true })
};

export const requestPasswordReset: BackendOperation<{ email: string }, { status: "queued" | "sent" }> = {
  id: "perfil.requestPasswordReset",
  label: "Solicitar reset de senha",
  domain: "perfil",
  kind: "command",
  source: {
    type: "auth",
    name: "supabase.auth.resetPasswordForEmail",
    description: "Helper oficial do Supabase Auth"
  },
  frontend: [{ file: "app/app/perfil/page.tsx", surface: "Botão Alterar senha" }],
  mock: async () => ({ status: "queued" })
};

export const configureMfa: BackendOperation<{ usuario_id: string }, { status: "pending" | "active" }> = {
  id: "perfil.configureMfa",
  label: "Configurar MFA",
  domain: "perfil",
  kind: "command",
  source: {
    type: "rpc",
    name: "rpc_configurar_mfa",
    description: "Habilita MFA para o usuário dentro de users.mfa_settings"
  },
  frontend: [{ file: "app/app/perfil/page.tsx", surface: "Botão Ativar MFA" }],
  mock: async () => ({ status: "pending" })
};

export const perfilOperations: OperationGroup = registerOperationGroup({
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  requestPasswordReset,
  configureMfa
});
