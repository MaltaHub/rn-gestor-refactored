'use client';

import Link from "next/link";

import { useVeiculos } from "@/hooks/use-veiculos";
import { signOut, useSupabaseSession } from "@/lib/supabase-auth";
import { hasSupabaseConfig } from "@/lib/supabase-config";

const featureHighlights = [
  "Centralize os veículos cadastrados por loja",
  "Acompanhe disponibilidade e status em tempo real",
  "Prepare relatórios rápidos para o time comercial",
];

export default function DashboardPage() {
  const { session, user, clearSession } = useSupabaseSession();
  const isAuthenticated = Boolean(session);

  const {
    data: veiculos = [],
    isLoading: isVeiculosLoading,
  } = useVeiculos({ enabled: isAuthenticated });

  const totalVeiculos = isVeiculosLoading ? "--" : veiculos.length;

  const handleLogout = async () => {
    await signOut();
    clearSession();
  };

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        {isAuthenticated ? (
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
        ) : (
          <section className="flex flex-col gap-6">
            <header className="space-y-4">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Gestor de Estoque
              </span>
              <h1 className="text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl">
                Organize o estoque da sua frota em um só lugar
              </h1>
              <p className="max-w-xl text-sm text-zinc-500">
                Conecte-se com sua conta Supabase para registrar entradas,
                controlar disponibilidade por loja e compartilhar informações com o time.
              </p>
            </header>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Fazer login para continuar
              </Link>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3">
              {featureHighlights.map((feature) => (
                <li
                  key={feature}
                  className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        )}

        {!hasSupabaseConfig && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Configure as variáveis `NEXT_PUBLIC_SUPABASE_URL` e
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` para habilitar o fluxo de
            autenticação.
          </div>
        )}
      </div>
    </div>
  );
}
