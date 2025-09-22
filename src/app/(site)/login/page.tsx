"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // action: conectar aqui a autenticação (ex: chamada ao provider ou supabase.auth.signInWithPassword)
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
              Interface pronta para ligar com o fluxo de autenticação do seu produto.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="email">
                Email corporativo
              </label>
              <Input id="email" type="email" required placeholder="nome@empresa.com" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200" htmlFor="password">
                Senha
              </label>
              <Input id="password" type="password" required placeholder="********" />
            </div>
            <div className="flex flex-col gap-4">
              <Button type="submit" size="lg" className="w-full">
                Entrar
              </Button>
              <Link
                href="/"
                className="text-center text-xs font-medium text-slate-300 underline-offset-4 hover:underline"
              >
                Voltar para a landing page
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
