'use client';

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { signInWithPassword, useSupabaseSession } from "@/lib/supabase-auth";
import { hasSupabaseConfig } from "@/lib/supabase-config";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, setSession } = useSupabaseSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectParam = searchParams.get("redirect") ?? "/estoque";
  const redirectPath = useMemo(() => {
    if (!redirectParam.startsWith("/")) {
      return "/estoque";
    }

    return redirectParam;
  }, [redirectParam]);

  useEffect(() => {
    if (session) {
      router.replace(redirectPath);
    }
  }, [session, router, redirectPath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasSupabaseConfig) {
      setErrorMessage(
        "Supabase não está configurado. Defina as variáveis de ambiente necessárias.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    const { session, error } = await signInWithPassword(email, password);

    if (error || !session) {
      setErrorMessage(error ?? "Não foi possível autenticar.");
      setSubmitting(false);
      return;
    }

    setSession(session);
    router.replace(redirectPath);
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-10 text-zinc-900">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Acessar conta</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Autentique-se com suas credenciais cadastradas no Supabase para
          continuar gerenciando o estoque.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !hasSupabaseConfig}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {errorMessage && (
          <div className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {!hasSupabaseConfig && (
          <div className="mt-4 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Defina as variáveis `NEXT_PUBLIC_SUPABASE_URL` e
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` para habilitar o login.
          </div>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link className="font-medium text-blue-600 hover:underline" href="/">
            Voltar ao dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
