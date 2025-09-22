"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, User } from "lucide-react";

import { coreModules } from "@/data/modules";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: ReactNode;
}

const baseLink = {
  href: "/app" as const,
  label: "Visão geral",
  summary: "Painel com métricas consolidadas da operação",
  icon: LayoutDashboard
};

const navLinks = [
  baseLink,
  ...coreModules.map(({ name, href, icon, summary, slug }) => ({
    href,
    label: name,
    icon,
    summary,
    slug
  }))
];

type NavLink = (typeof navLinks)[number];
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? "";

  const activeLink = navLinks.reduce<NavLink | undefined>((current, link) => {
    const isActive = currentPath === link.href || currentPath.startsWith(`${link.href}/`);
    return isActive ? link : current;
  }, undefined);

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
        <AppTopBar activeLink={activeLink} />
        <main className="flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function AppTopBar({ activeLink }: { activeLink?: NavLink }) {
  return (
    <div className="border-b border-white/5 bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Módulo em foco</p>
          <p className="text-sm font-medium text-slate-200">{(activeLink ?? baseLink).label}</p>
          <p className="text-xs text-slate-500">{(activeLink ?? baseLink).summary}</p>
        </div>
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
  );
}
