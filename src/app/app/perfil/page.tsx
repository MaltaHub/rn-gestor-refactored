"use client";

import { ChangeEvent, ReactNode, useState } from "react";
import { ShieldCheck, Smartphone, User2 } from "lucide-react";
import { clsx } from "clsx";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
}

interface PreferenceData {
  notifications: boolean;
  weeklyDigest: boolean;
  dataSharing: boolean;
}

const defaultProfile: ProfileData = {
  name: "Ana Ribeiro",
  email: "ana.ribeiro@gestor.com",
  phone: "(11) 99999-0000",
  role: "Gestora de operações",
  bio: "Conduz iniciativas de modernização e mantém os indicadores da operação sob controle."
};

const defaultPreferences: PreferenceData = {
  notifications: true,
  weeklyDigest: true,
  dataSharing: false
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [preferences, setPreferences] = useState<PreferenceData>(defaultPreferences);

  const handleProfileChange = (field: keyof ProfileData) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const togglePreference = (field: keyof PreferenceData) => () => {
    setPreferences((previous) => ({ ...previous, [field]: !previous[field] }));
  };

  const handleSave = () => {
    // action: persistir alterações do perfil (ex: chamada a API de usuários)
    console.info("Salvar perfil", profile, preferences);
  };

  const handleReset = () => {
    setProfile(defaultProfile);
    setPreferences(defaultPreferences);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Perfil pessoal"
        description="Revise informações individuais e mantenha o cockpit alinhado às suas preferências."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleReset}>
              Reverter
            </Button>
            <Button onClick={handleSave}>
              Salvar alterações
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
                <User2 className="h-4 w-4" />
              </span>
              Dados básicos
            </CardTitle>
            <CardDescription>Mapeie os campos essenciais para integrações futuras.</CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo">
                <Input value={profile.name} onChange={handleProfileChange("name")} />
              </Field>
              <Field label="Cargo / função">
                <Input value={profile.role} onChange={handleProfileChange("role")} />
              </Field>
              <Field label="Email corporativo">
                <Input type="email" value={profile.email} onChange={handleProfileChange("email")} />
              </Field>
              <Field label="Telefone para contato">
                <Input
                  value={profile.phone}
                  onChange={handleProfileChange("phone")}
                  placeholder="(00) 00000-0000"
                />
              </Field>
            </div>
            <Field label="Resumo profissional">
              <textarea
                value={profile.bio}
                onChange={handleProfileChange("bio")}
                className="min-h-[96px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
                <Smartphone className="h-4 w-4" />
              </span>
              Preferências rápidas
            </CardTitle>
            <CardDescription>Defina comunicações prioritárias enquanto conecta o restante do stack.</CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <PreferenceToggle
              label="Notificações em tempo real"
              description="Receba alertas sobre mudanças críticas diretamente no cockpit."
              active={preferences.notifications}
              onToggle={togglePreference("notifications")}
            />
            <PreferenceToggle
              label="Resumo semanal"
              description="Consolide indicadores em um email de produtividade todas as segundas."
              active={preferences.weeklyDigest}
              onToggle={togglePreference("weeklyDigest")}
            />
            <PreferenceToggle
              label="Compartilhar dados com marketing"
              description="Autorize sincronização de leads e campanhas entre times."
              active={preferences.dataSharing}
              onToggle={togglePreference("dataSharing")}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/5 bg-slate-900/80">
        <CardHeader className="gap-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
              <ShieldCheck className="h-4 w-4" />
            </span>
            Segurança e auditoria
          </CardTitle>
          <CardDescription>
            Configure revisões periódicas e registre atividades críticas para manter a operação rastreável.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4 text-sm text-slate-300">
          <p>
            Use este espaço para conectar políticas de segurança, redefinição de senha e autenticação multifator. Os
            comentários `action` indicam onde registrar confirmações com o backend.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // action: iniciar fluxo de alteração de senha
                console.info("Abrir alteração de senha");
              }}
            >
              Alterar senha
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // action: configurar MFA
                console.info("Configurar MFA");
              }}
            >
              Ativar MFA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-300">
      <span className="font-semibold text-slate-200">{label}</span>
      {children}
    </label>
  );
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}

function PreferenceToggle({ label, description, active, onToggle }: PreferenceToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "flex w-full flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition-colors",
        active
          ? "border-sky-400/60 bg-sky-400/10 text-slate-100"
          : "border-white/10 bg-slate-950/40 text-slate-300 hover:border-sky-400/40"
      )}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-slate-400">{description}</span>
    </button>
  );
}
