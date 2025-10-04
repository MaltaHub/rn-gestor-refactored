"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { signIn } from "@/services/auth"; // novo serviço
import { useAuth } from "@/hooks/use-auth"; // hook reativo

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectParam = searchParams.get("redirect") ?? "/vitrine";
  const redirectPath = useMemo(() => {
    return redirectParam.startsWith("/") ? redirectParam : "/vitrine";
  }, [redirectParam]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [loading, isAuthenticated, router, redirectPath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await signIn(email, password);
      router.replace(redirectPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Não foi possível autenticar.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-6 py-10 text-zinc-900">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-zinc-900">Acessar conta</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Entre com suas credenciais para continuar gerenciando o estoque.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="password"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {errorMessage && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-zinc-500">
          <p>
            Não tem conta?{" "}
            <Link
              className="font-medium text-blue-600 hover:underline"
              href="/cadastro"
            >
              Cadastre-se
            </Link>
          </p>
          <p className="mt-2">
            <Link className="font-medium text-blue-600 hover:underline" href="/">
              Voltar ao dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
