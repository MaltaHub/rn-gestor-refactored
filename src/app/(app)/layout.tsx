"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth"; // novo hook de sessão

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
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-600">
        <p className="text-sm">Carregando sessão do usuário...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
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
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-900"
          >
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
