"use client";

import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { ShieldCheck, Smartphone, User2 } from "lucide-react";
import { clsx } from "clsx";

import { LojaSwitch } from "@/components/navigation/loja-switch";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGlobalLojaId } from "@/hooks/use-loja";
import { usuariosService } from "@/lib/services/domains";
import type { LojaDisponivel, UsuarioPerfil, UsuarioPreferencias } from "@/types/domain";

type PerfilCampo = keyof UsuarioPerfil;
type PreferenciaCampo = keyof UsuarioPreferencias;

export default function ProfilePage() {
  const globalLojaId = useGlobalLojaId();
  const [lojasDisponiveis, setLojasDisponiveis] = useState<LojaDisponivel[]>([]);
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [perfilOriginal, setPerfilOriginal] = useState<UsuarioPerfil | null>(null);
  const [preferencias, setPreferencias] = useState<UsuarioPreferencias | null>(null);
  const [preferenciasOriginais, setPreferenciasOriginais] = useState<UsuarioPreferencias | null>(null);
  const [lojaAtual, setLojaAtual] = useState<string | null>(null);
  const [alterandoLoja, setAlterandoLoja] = useState(false);
  const [isCarregando, setIsCarregando] = useState(true);
  const [isSalvando, setIsSalvando] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const [dadosPerfil, dadosPreferencias, lojas] = await Promise.all([
          usuariosService.obterPerfilUsuario(),
          usuariosService.obterPreferenciasUsuario(),
          usuariosService.listarLojasDisponiveis()
        ]);
        if (!ativo) return;
        setPerfil(dadosPerfil);
        setPerfilOriginal(dadosPerfil);
        setPreferencias(dadosPreferencias);
        setPreferenciasOriginais(dadosPreferencias);
        setLojasDisponiveis(lojas);
      } catch (error) {
        console.error("Falha ao carregar dados do perfil", error);
        setFeedback("Não foi possível carregar os dados do perfil.");
      } finally {
        if (ativo) {
          setIsCarregando(false);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    setLojaAtual(globalLojaId ?? null);
  }, [globalLojaId]);

  const lojaOptions = useMemo(
    () =>
      lojasDisponiveis.map((loja) => ({
        id: loja.id,
        nome: loja.nome,
        cidade: loja.cidade,
        uf: loja.uf
      })),
    [lojasDisponiveis]
  );

  const handleProfileChange = (campo: PerfilCampo) => (event: ChangeEvent<HTMLInputElement>) => {
    const valor = event.target.value;
    setPerfil((atual) => (atual ? { ...atual, [campo]: valor } : atual));
  };

  const handleSalvar = async () => {
    if (!perfil || !preferencias) return;
    setIsSalvando(true);
    setFeedback(null);
    try {
      await Promise.all([
        usuariosService.atualizarPerfilUsuario({ ...perfil }),
        usuariosService.atualizarPreferenciasUsuario({ ...preferencias })
      ]);
      setPerfilOriginal(perfil);
      setPreferenciasOriginais(preferencias);
      setFeedback("Alterações salvas com sucesso.");
    } catch (error) {
      console.error("Falha ao salvar alterações de perfil", error);
      setFeedback("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setIsSalvando(false);
    }
  };

  const handleReset = () => {
    setPerfil(perfilOriginal);
    setPreferencias(preferenciasOriginais);
    setFeedback("Alterações revertidas ao último estado salvo.");
  };

  const handleAlterarSenha = async () => {
    const senhaAtual = window.prompt("Informe a senha atual");
    if (!senhaAtual) return;
    const novaSenha = window.prompt("Informe a nova senha");
    if (!novaSenha) return;
    setFeedback(null);
    try {
      await usuariosService.alterarSenhaUsuario(senhaAtual, novaSenha);
      setFeedback("Senha atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao alterar senha do usuário", error);
      setFeedback("Não foi possível alterar a senha. Revise as informações e tente novamente.");
    }
  };

  const handleAtivarMfa = async () => {
    const metodo = window.prompt("Escolha o método de MFA (sms/app)", "app");
    if (!metodo) return;
    if (metodo !== "sms" && metodo !== "app") {
      setFeedback("Método de MFA inválido. Utilize 'sms' ou 'app'.");
      return;
    }
    setFeedback(null);
    try {
      await usuariosService.ativarMfaUsuario(metodo);
      setFeedback("Autenticação multifator configurada com sucesso.");
    } catch (error) {
      console.error("Falha ao ativar MFA", error);
      setFeedback("Não foi possível ativar a autenticação multifator.");
    }
  };

  const handleTrocarLoja = async (lojaId: string) => {
    setAlterandoLoja(true);
    setFeedback(null);
    try {
      await usuariosService.definirLojaAtual(lojaId);
      setLojaAtual(lojaId);
      setFeedback("Loja atual atualizada com sucesso.");
    } catch (error) {
      console.error("Falha ao definir loja atual", error);
      setFeedback("Não foi possível atualizar a loja atual.");
    } finally {
      setAlterandoLoja(false);
    }
  };

  const togglePreferencia = (campo: PreferenciaCampo) => async () => {
    if (!preferencias) return;
    const novoValor = !preferencias[campo];
    setPreferencias({ ...preferencias, [campo]: novoValor });
    setFeedback(null);
    try {
      await usuariosService.atualizarPreferenciasUsuario({ [campo]: novoValor });
      setFeedback("Preferência atualizada.");
    } catch (error) {
      console.error("Erro ao atualizar preferência", error);
      setPreferencias((atual) => (atual ? { ...atual, [campo]: !novoValor } : atual));
      setFeedback("Não foi possível atualizar a preferência selecionada.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Perfil pessoal"
        description="Revise informações individuais, loja padrão e preferências de comunicação."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleReset} disabled={isCarregando || isSalvando}>
              Reverter
            </Button>
            <Button onClick={handleSalvar} disabled={isCarregando || isSalvando}>
              {isSalvando ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        }
      />

      {feedback ? <p className="text-xs text-slate-400">{feedback}</p> : null}

      {isCarregando ? (
        <p className="text-sm text-slate-400">Carregando dados do perfil...</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {lojaOptions.length > 0 ? (
            <Card className="border-white/10 bg-slate-900/70">
              <CardHeader className="gap-3">
                <CardTitle className="text-white">Loja atual</CardTitle>
                <CardDescription>
                  Alterar a loja padrão ajusta automaticamente o escopo das operações de escrita.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LojaSwitch
                  lojas={lojaOptions}
                  value={lojaAtual}
                  onChange={handleTrocarLoja}
                  isLoading={alterandoLoja}
                />
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-white/10 bg-slate-900/70">
            <CardHeader className="gap-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
                  <User2 className="h-4 w-4" />
                </span>
                Dados básicos
              </CardTitle>
              <CardDescription>Campos carregados diretamente de `usuarios.perfil`.</CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome completo">
                  <Input value={perfil?.nome ?? ""} onChange={handleProfileChange("nome")} />
                </Field>
                <Field label="Cargo / função">
                  <Input value={perfil?.cargo ?? ""} onChange={handleProfileChange("cargo")} />
                </Field>
                <Field label="Email corporativo">
                  <Input type="email" value={perfil?.email ?? ""} onChange={handleProfileChange("email")} />
                </Field>
                <Field label="Telefone para contato">
                  <Input value={perfil?.telefone ?? ""} onChange={handleProfileChange("telefone")} />
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="gap-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="rounded-full bg-sky-500/10 p-2 text-sky-200">
                <Smartphone className="h-4 w-4" />
              </span>
              Preferências rápidas
            </CardTitle>
            <CardDescription>Integração direta com `usuarios.preferencias`.</CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <PreferenceToggle
              label="Notificações por email"
              description="Receba alertas sobre mudanças críticas diretamente no console."
              active={Boolean(preferencias?.notificacoesEmail)}
              onToggle={togglePreferencia("notificacoesEmail")}
              disabled={!preferencias}
            />
            <PreferenceToggle
              label="Notificações por SMS"
              description="Acione mensagens para eventos de alta prioridade."
              active={Boolean(preferencias?.notificacoesSms)}
              onToggle={togglePreferencia("notificacoesSms")}
              disabled={!preferencias}
            />
            <PreferenceToggle
              label="Resumo semanal"
              description="Consolide indicadores em um email de produtividade às segundas-feiras."
              active={Boolean(preferencias?.resumoSemanal)}
              onToggle={togglePreferencia("resumoSemanal")}
              disabled={!preferencias}
            />
            <PreferenceToggle
              label="Tema escuro"
              description="Mantenha o console no modo noturno em todos os dispositivos."
              active={Boolean(preferencias?.darkMode)}
              onToggle={togglePreferencia("darkMode")}
              disabled={!preferencias}
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
            Conecte políticas de segurança, redefinição de senha e MFA às operações de escrita.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4 text-sm text-slate-300">
          <p>
            Os botões abaixo já apontam para `usuarios.alterarSenha` e `usuarios.ativarMFA`. Os logs de auditoria podem ser
            conectados ao mesmo fluxo para rastrear ações críticas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleAlterarSenha}>
              Alterar senha
            </Button>
            <Button variant="outline" onClick={handleAtivarMfa}>
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
  disabled?: boolean;
}

function PreferenceToggle({ label, description, active, onToggle, disabled = false }: PreferenceToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={clsx(
        "flex w-full flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition-colors",
        active
          ? "border-sky-400/60 bg-sky-400/10 text-slate-100"
          : "border-white/10 bg-slate-950/40 text-slate-300 hover:border-sky-400/40",
        disabled ? "cursor-not-allowed opacity-60" : ""
      )}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-slate-400">{description}</span>
    </button>
  );
}
