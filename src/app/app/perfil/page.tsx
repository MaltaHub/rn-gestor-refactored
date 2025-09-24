"use client";

import { ChangeEvent, ReactNode, useState } from "react";
import { ShieldCheck, Smartphone, User2 } from "lucide-react";
import { clsx } from "clsx";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProfileRecord {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  bio: string;
}

interface PreferenceRecord {
  notificacoes: boolean;
  resumo_semanal: boolean;
  compartilhar_dados: boolean;
}

const defaultProfile: ProfileRecord = {
  id: "user-01",
  nome: "Ana Gestora",
  cargo: "Diretora comercial",
  email: "ana@empresa.com",
  telefone: "+55 11 99999-0000",
  bio: "Responsavel por liderar a operacao comercial e conectar diferentes times na jornada do cliente."
};

const defaultPreferences: PreferenceRecord = {
  notificacoes: true,
  resumo_semanal: false,
  compartilhar_dados: true
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileRecord>(defaultProfile);
  const [preferences, setPreferences] = useState<PreferenceRecord>(defaultPreferences);

  const handleProfileChange = (field: keyof ProfileRecord) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const togglePreference = (field: keyof PreferenceRecord) => () => {
    setPreferences((previous) => ({ ...previous, [field]: !previous[field] }));
  };

  const handleSave = () => {
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
        description="Revise informacoes individuais e mantenha o cockpit alinhado as suas preferencias."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleReset}>
              Reverter
            </Button>
            <Button onClick={handleSave}>
              Salvar alteracoes
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
              Dados basicos
            </CardTitle>
            <CardDescription>Mapeie os campos essenciais para integracoes futuras.</CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo">
                <Input value={profile.nome} onChange={handleProfileChange("nome")} />
              </Field>
              <Field label="Cargo / funcao">
                <Input value={profile.cargo} onChange={handleProfileChange("cargo")} />
              </Field>
              <Field label="Email corporativo">
                <Input type="email" value={profile.email} onChange={handleProfileChange("email")} />
              </Field>
              <Field label="Telefone para contato">
                <Input value={profile.telefone} onChange={handleProfileChange("telefone")} />
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
              Preferencias rapidas
            </CardTitle>
            <CardDescription>Defina comunicacoes prioritarias enquanto conecta o restante do stack.</CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <PreferenceToggle
              label="Notificacoes em tempo real"
              description="Receba alertas sobre mudancas criticas diretamente no cockpit."
              active={preferences.notificacoes}
              onToggle={togglePreference("notificacoes")}
            />
            <PreferenceToggle
              label="Resumo semanal"
              description="Consolide indicadores em um email de produtividade todas as segundas."
              active={preferences.resumo_semanal}
              onToggle={togglePreference("resumo_semanal")}
            />
            <PreferenceToggle
              label="Compartilhar dados com marketing"
              description="Autorize sincronizacao de leads e campanhas entre times."
              active={preferences.compartilhar_dados}
              onToggle={togglePreference("compartilhar_dados")}
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
            Seguranca e auditoria
          </CardTitle>
          <CardDescription>
            Configure revisoes periodicas e registre atividades criticas para manter a operacao rastreavel.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4 text-sm text-slate-300">
          <p>
            Use este espaco para conectar politicas de seguranca, redefinicao de senha e autenticacao multifator. Os
            comentarios `action` indicam onde registrar confirmacoes com integrações reais.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                console.info("Alteracao de senha", profile.email);
              }}
            >
              Alterar senha
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                console.info("Configurar MFA", profile.id);
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
