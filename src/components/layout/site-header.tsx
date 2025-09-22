"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "#solucoes", label: "Soluções" },
  { href: "#modulos", label: "Módulos" },
  { href: "#operacao", label: "Operação" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-sky-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500 text-base font-bold text-slate-950">
            GA
          </span>
          Gestor Automotivo
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 md:flex">
          {navItems.map(({ href, label }) => (
            <a key={href} href={href} className="transition-colors hover:text-sky-100">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {pathname?.startsWith("/app") ? (
            <Link href="/">
              <Button variant="ghost" size="sm">
                Ver landing
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-xs font-medium text-slate-300 transition-colors hover:text-sky-100 sm:inline">
                Entrar
              </Link>
              <Link href="/app">
                <Button size="sm" className="gap-2">
                  Acessar cockpit
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
