"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { coreModules } from "@/data/modules";
import type { ModuleSlug } from "@/data/modules";
import { Button } from "@/components/ui/button";
import { LojaSwitch, type LojaOption } from "@/components/navigation/loja-switch";
import { useGlobalLojaId } from "@/hooks/use-loja";
import { contextoService, usuariosService } from "@/lib/services/domains";
import type { ConcessionariaContexto, PermissaoModulo } from "@/types/domain";

interface AppShellProps {
  children: ReactNode;
}

interface NavLink {
  href: string;
  label: string;
  summary: string;
  icon: LucideIcon;
  slug?: ModuleSlug;
}

const baseLink: NavLink = {
  href: "/app",
  label: "Visão geral",
  summary: "Painel com métricas consolidadas da operação",
  icon: LayoutDashboard
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const globalLojaId = useGlobalLojaId();

  const [contexto, setContexto] = useState<ConcessionariaContexto | null>(null);
  const [permissoes, setPermissoes] = useState<PermissaoModulo[]>([]);
  const [carregandoContexto, setCarregandoContexto] = useState(true);
  const [atualizandoLoja, setAtualizandoLoja] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const [ctx, perms] = await Promise.all([
          contextoService.fetchConcessionariaContext(),
          contextoService.fetchPermissoesDeModulo()
        ]);
        if (!ativo) return;
        setContexto(ctx);
        setPermissoes(perms);
        if (ctx.lojaAtualId) {
          contextoService.setGlobalLoja(ctx.lojaAtualId);
        }
      } catch (error) {
        console.error("Falha ao carregar contexto da concessionária", error);
      } finally {
        if (ativo) {
          setCarregandoContexto(false);
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!contexto || contexto.lojaAtualId || contexto.lojas.length === 0) {
      return;
    }
    const fallback = contexto.lojas[0].id;
    contextoService.setGlobalLoja(fallback);
    setContexto((previous) => (previous ? { ...previous, lojaAtualId: fallback } : previous));
  }, [contexto]);

  const lojaOptions = useMemo<LojaOption[]>(() => {
    return (contexto?.lojas ?? []).map(({ id, nome, cidade, uf }) => ({ id, nome, cidade, uf }));
  }, [contexto]);

  const permissoesPermitidas = useMemo(() => {
    if (!permissoes.length) {
      return null;
    }
    return new Set(permissoes.filter((item) => item.permitido).map((item) => item.slug));
  }, [permissoes]);

  const navLinks = useMemo<NavLink[]>(() => {
    const modules = permissoesPermitidas
      ? coreModules.filter((module) => permissoesPermitidas.has(module.slug))
      : coreModules;

    return [
      baseLink,
      ...modules.map<NavLink>((module) => ({
        href: module.href,
        label: module.name,
        summary: module.summary,
        icon: module.icon,
        slug: module.slug
      }))
    ];
  }, [permissoesPermitidas]);

  const activeLink = useMemo(() => {
    return navLinks.find((link) => currentPath === link.href || currentPath.startsWith(`${link.href}/`));
  }, [navLinks, currentPath]);

  const lojaAtualId = globalLojaId ?? contexto?.lojaAtualId ?? null;
  const lojaAtualNome = lojaOptions.find((loja) => loja.id === lojaAtualId)?.nome;

  const handleLojaChange = async (lojaId: string) => {
    if (!lojaId) return;
    setAtualizandoLoja(true);
    try {
      await usuariosService.definirLojaAtual(lojaId);
      setContexto((previous) => (previous ? { ...previous, lojaAtualId: lojaId } : previous));
    } catch (error) {
      console.error("Falha ao definir loja atual", error);
    } finally {
      setAtualizandoLoja(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="hidden w-72 flex-col border-r border-white/5 bg-slate-950/60 px-6 py-10 lg:flex">
        <Link href="/" className="mb-10 flex items-center gap-3 text-sm font-semibold tracking-wide text-sky-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-xl font-bold text-slate-950">
            GA
          </span>
          Gestor Automotivo
        </Link>

        <nav className="flex flex-1 flex-col gap-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = currentPath === href || currentPath.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/40"
                    : "text-slate-300 hover:bg-slate-800/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 space-y-2 rounded-2xl border border-white/5 bg-slate-900/70 p-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Austeridade operacional</p>
          <p>
            Layouts e ações foram mapeados para receber autenticação, integrações e auditoria sem refatorações
            adicionais.
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <AppTopBar
          activeLink={activeLink}
          lojaOptions={lojaOptions}
          lojaAtualId={lojaAtualId}
          lojaAtualNome={lojaAtualNome}
          onChangeLoja={lojaOptions.length > 0 ? handleLojaChange : undefined}
          isLoadingLoja={carregandoContexto || atualizandoLoja}
        />
        <main className="flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

interface AppTopBarProps {
  activeLink?: NavLink;
  lojaOptions: LojaOption[];
  lojaAtualId: string | null;
  lojaAtualNome?: string;
  onChangeLoja?: (lojaId: string) => Promise<void>;
  isLoadingLoja: boolean;
}

function AppTopBar({
  activeLink,
  lojaOptions,
  lojaAtualId,
  lojaAtualNome,
  onChangeLoja,
  isLoadingLoja
}: AppTopBarProps) {
  const modulo = activeLink ?? baseLink;

  return (
    <div className="border-b border-white/5 bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Módulo em foco</p>
          <p className="text-sm font-medium text-slate-200">{modulo.label}</p>
          <p className="text-xs text-slate-500">{modulo.summary}</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Loja atual: {lojaAtualNome ?? "Selecione uma loja"}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {lojaOptions.length > 0 ? (
            <LojaSwitch
              lojas={lojaOptions}
              value={lojaAtualId ?? lojaOptions[0]?.id ?? ""}
              onChange={onChangeLoja}
              isLoading={isLoadingLoja}
              className="w-full sm:w-auto"
            />
          ) : null}
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-200">
              <User className="h-4 w-4" />
            </span>
            <div className="space-y-1 pr-1">
              <p className="font-medium text-slate-200">Perfil ativo</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Preferências pessoais</p>
            </div>
            <Link href="/app/perfil">
              <Button variant="ghost" size="sm" className="text-[11px] uppercase tracking-[0.2em]">
                Abrir perfil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
