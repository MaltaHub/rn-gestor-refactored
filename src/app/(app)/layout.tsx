'use client';

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useSupabaseSession } from "@/lib/supabase-auth";

const navigation = [
  { label: "Estoque", href: "/estoque" },
  { label: "Configurações", href: "/configuracoes" },
];

function isActivePath(pathname: string | null, target: string) {
  if (!pathname) return false;
  if (pathname === target) return true;
  return pathname.startsWith(`${target}/`);
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading, isConfigured } = useSupabaseSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (!session) {
      const redirectTarget = pathname ?? "/estoque";
      const sanitizedTarget = redirectTarget.startsWith("/")
        ? redirectTarget
        : "/estoque";

      router.replace(`/login?redirect=${encodeURIComponent(sanitizedTarget)}`);
    }
  }, [isConfigured, isLoading, session, router, pathname]);

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-zinc-900">
        <div className="w-full max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Configure as variáveis `NEXT_PUBLIC_SUPABASE_URL` e
          `NEXT_PUBLIC_SUPABASE_ANON_KEY` para habilitar o sistema de
          autenticação do Gestor de Estoque.
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-600">
        <p className="text-sm">Redirecionando para a tela de login…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
            Gestor de Estoque
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600">
            {navigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  className={`transition hover:text-zinc-900 ${
                    active ? "text-zinc-900" : ""
                  }`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
