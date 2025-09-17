import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  if (user) return <Navigate to="/app" replace />;

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message ?? "Credenciais invalidas");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80 lg:flex lg:flex-col lg:justify-between">
        <div className="p-10 text-primary-foreground">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <ShieldCheck className="h-8 w-8" />
            Portal do gestor
          </div>
          <p className="mt-5 max-w-md text-sm text-primary-foreground/80">
            Controle completo de estoque, anuncios, vendas e operacoes da sua empresa em um unico lugar.
          </p>
        </div>
        <div className="p-10 text-sm text-primary-foreground/70">
          (c) {new Date().getFullYear()} Supra Motors - Todos os direitos reservados.
        </div>
      </div>

      <div className="flex items-center justify-center bg-background">
        <Card className="m-6 w-full max-w-md shadow-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Acessar painel</CardTitle>
            <CardDescription>
              Insira suas credenciais corporativas para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2 text-left">
                <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Email corporativo
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="nome@empresa.com"
                />
              </div>

              <div className="space-y-2 text-left">
                <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="********"
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Entrando
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-xs text-muted-foreground">
              Problemas com o acesso? Contate o administrador da empresa.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;

