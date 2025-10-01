"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useVeiculos } from "@/hooks/use-estoque";
import { signOut } from "@/services/auth"; // novo serviço
import { useAuth } from "@/hooks/use-auth"; // novo hook

const featureHighlights = [
  "Centralize os veículos cadastrados por loja",
  "Acompanhe disponibilidade e status em tempo real",
  "Prepare relatórios rápidos para o time comercial",
];

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const {
    data: veiculos = [],
    isLoading: isVeiculosLoading,
  } = useVeiculos();

  const totalVeiculos = isVeiculosLoading ? "--" : veiculos.length;

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-10 text-sm text-zinc-500">
        Carregando sessão...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-10 text-sm text-zinc-500">
        Redirecionando para login…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-zinc-900">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center space-y-10">
        <section className="flex flex-col gap-6">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
                Visão geral
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                Olá, {user?.email ?? "gestor"}!
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-500">
                Gerencie o estoque cadastrado, cadastre novos veículos e
                mantenha sua equipe alinhada com dados atualizados.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/estoque"
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
              >
                Ir para estoque
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-red-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-zinc-500">Veículos cadastrados</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-900">
                {totalVeiculos}
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                {isVeiculosLoading
                  ? "Carregando informações do estoque..."
                  : "Dados obtidos via cache do React Query."}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-zinc-500">Ações rápidas</p>
              <ul className="mt-3 space-y-2 text-sm text-blue-600">
                <li>
                  <Link className="hover:underline" href="/estoque">
                    Consultar estoque completo
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="/configuracoes">
                    Ajustar catálogo e lojas
                  </Link>
                </li>
              </ul>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
