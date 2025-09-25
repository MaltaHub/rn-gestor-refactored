"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginScreen() {
  const router = useRouter();
  const { login, error, clearError, isAuthenticating } = useAuth();
  const [sucesso, setSucesso] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setSucesso(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const resultado = await login({ email, password });

    if (resultado.ok) {
      const destino = resultado.destino ?? "/app";
      setSucesso(`Autenticado! Redirecionando para ${destino === "/app" ? "o cockpit" : "o lobby"}.`);
      router.push(destino);
      return;
    }
  };

  const feedback = sucesso ?? error;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 sm:px-6 lg:px-10">
      <Card className="w-full max-w-xl bg-slate-900/70 p-10">
        <CardHeader className="items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-200">
            <LogIn className="h-5 w-5" />
          </span>
          <div>
            <CardTitle className="text-2xl">Acesse o cockpit</CardTitle>
            <CardDescription>
              Utilize suas credenciais para continuar a jornada de gestão da concessionária.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="email">
                Email corporativo
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nome@empresa.com"
                disabled={isAuthenticating}
                onChange={() => clearError()}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="password">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="********"
                disabled={isAuthenticating}
                onChange={() => clearError()}
              />
            </div>
            <div className="flex flex-col gap-4">
              <Button type="submit" size="lg" className="w-full" disabled={isAuthenticating}>
                {isAuthenticating ? "Autenticando..." : "Entrar"}
              </Button>
              <Link
                href="/"
                className="text-center text-xs font-medium text-slate-300 underline-offset-4 hover:underline"
              >
                Voltar para a landing page
              </Link>
              <Link
                href="/lobby"
                className="text-center text-xs font-medium text-sky-200 underline-offset-4 hover:underline"
              >
                Acessar lobby de onboarding
              </Link>
            </div>
          </form>
          {feedback ? (
            <p
              className={`mt-4 text-center text-xs ${
                sucesso ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {feedback}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
