"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signUp } from "@/services/auth";

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("As senhas precisam ser iguais.");
      return;
    }

    try {
      setSubmitting(true);
      await signUp(email.trim(), password);
      setSuccessMessage(
        "Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro."
      );
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => router.replace("/login"), 4000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível concluir o cadastro."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-zinc-50 to-zinc-100 px-6 py-10 text-zinc-900">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-zinc-900">Criar uma conta</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Preencha os dados para solicitar acesso ao Gestor de Estoque.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="email">
              E-mail corporativo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="nome@empresa.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700" htmlFor="confirm-password">
              Confirmar senha
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Registrando..." : "Solicitar acesso"}
          </button>
        </form>

        {successMessage && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-zinc-500">
          <p>
            Já possui acesso?{" "}
            <Link className="font-medium text-blue-600 hover:underline" href="/login">
              Entrar
            </Link>
          </p>
          <p className="mt-2">
            <Link className="font-medium text-blue-600 hover:underline" href="/">
              Voltar ao início
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
