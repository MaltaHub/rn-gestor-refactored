"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useVeiculos } from "@/hooks/use-estoque";
import { signOut } from "@/services/auth";
import { useAuth } from "@/hooks/use-auth";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { VeiculoResumo } from "@/types/estoque";

const featureHighlights = [
  {
    title: "Visão centralizada",
    description:
      "Reúna lojas, veículos e métricas em um painel único para decidir com agilidade.",
  },
  {
    title: "Acompanhamento em tempo real",
    description:
      "Monitore status de venda, documentação e disponibilidade sem sair da página.",
  },
  {
    title: "Fluxo colaborativo",
    description:
      "Cadastre veículos, ajuste estoque e compartilhe atualizações com o restante do time.",
  },
];

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const {
    data: veiculos = [] as VeiculoResumo[],
    isLoading: isVeiculosLoading,
  } = useVeiculos();
  const veiculosCount = Array.isArray(veiculos) ? veiculos.length : veiculos ? 1 : 0;
  const totalVeiculos = isVeiculosLoading ? "--" : veiculosCount;

  const {
    data: empresa,
    isLoading: isEmpresaLoading,
    error: empresaError,
  } = useEmpresaDoUsuario(isAuthenticated);

  const aguardandoAprovacao = !isEmpresaLoading && empresa === null;

  const handleLogout = async () => {
    await signOut();
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
    <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-white px-6 py-12 text-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col justify-between gap-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
              Visão geral
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
              Olá, {user?.email ?? "gestor"}!
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              Acompanhe o status do seu cadastro e gerencie o estoque de veículos com praticidade.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="/vitrine"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Ver vitrine
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

        {aguardandoAprovacao && (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-6 py-5 text-sm text-yellow-800 shadow-sm">
            Aguarde seu registro ser aceito! Agradecemos pela paciência 🐻✨
          </div>
        )}

        {empresaError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm">
            Não foi possível carregar os dados da empresa. Tente novamente mais tarde.
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Veículos cadastrados</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-900">{totalVeiculos}</p>
            <p className="mt-2 text-xs text-zinc-400">
              {isVeiculosLoading
                ? "Carregando informações do estoque..."
                : "Dados sincronizados via React Query."}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Status do cadastro</p>
            <p className="mt-3 text-lg font-semibold text-zinc-900">
              {isEmpresaLoading ? "Verificando..." : aguardandoAprovacao ? "Em análise" : "Ativo"}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              {aguardandoAprovacao
                ? "Nossa equipe está conferindo suas informações."
                : "Você já pode acessar todos os recursos disponíveis."}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Acesso rápido</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="text-blue-600 hover:underline" href="/estoque">
                  Consultar estoque completo
                </Link>
              </li>
              <li>
                <Link className="text-blue-600 hover:underline" href="/configuracoes">
                  Ajustar catálogo, lojas e modelos
                </Link>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Precisa de ajuda?</p>
            <p className="mt-3 text-sm text-zinc-600">
              Fale com o suporte para desbloquear funcionalidades extras ou sanar dúvidas.
            </p>
            <Link
              href="mailto:suporte@gestor.com"
              className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
            >
              Enviar e-mail
            </Link>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {featureHighlights.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-zinc-900">{feature.title}</h2>
              <p className="mt-2 text-sm text-zinc-500">{feature.description}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
