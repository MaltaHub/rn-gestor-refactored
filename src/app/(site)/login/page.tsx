"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/services/domains";

interface LoginFeedback {
  tipo: "sucesso" | "erro" | "info";
  mensagem: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<LoginFeedback | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const resultado = await authService.login(email, password);
      setFeedback({ tipo: "sucesso", mensagem: `Autenticado como ${email}. Token expira em ${resultado.expiracao}.` });
      const destino = await authService.resolveDestinoInicial();
      setFeedback((previous) => ({
        tipo: "sucesso",
        mensagem: `${previous?.mensagem ?? "Login realizado."} Redirecionando para ${destino.destino === "/app" ? "o console" : "o lobby"}.`
      }));
      router.push(destino.destino);
    } catch (error) {
      console.error("Erro ao realizar login", error);
      setFeedback({ tipo: "erro", mensagem: "Credenciais inválidas ou serviço indisponível." });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Interface pronta para ligar com o fluxo de autenticação e direcionar o usuário para o próximo passo.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="email">
                Email corporativo
              </label>
              <Input id="email" name="email" type="email" required placeholder="nome@empresa.com" disabled={isSubmitting} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="password">
                Senha
              </label>
              <Input id="password" name="password" type="password" required placeholder="********" disabled={isSubmitting} />
            </div>
            <div className="flex flex-col gap-4">
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Autenticando..." : "Entrar"}
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
                feedback.tipo === "sucesso"
                  ? "text-emerald-300"
                  : feedback.tipo === "erro"
                  ? "text-rose-300"
                  : "text-slate-400"
              }`}
            >
              {feedback.mensagem}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
