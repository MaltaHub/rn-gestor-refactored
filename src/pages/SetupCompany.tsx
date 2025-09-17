import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { Clock, ShieldPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { acceptInvite, createCompany, fetchInvites, type CompanyInvite } from "@/services/empresa";

export default function SetupCompany() {
  const { user, empresaId, refreshEmpresa } = useAuthStore();
  const [nome, setNome] = useState("");
  const [dominio, setDominio] = useState("");

  const invitesQuery = useQuery({
    queryKey: ["company-invites", user?.id],
    queryFn: () => fetchInvites(user!.id),
    enabled: Boolean(user?.id),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuario nao autenticado.");
      const nomeLimpo = nome.trim();
      if (!nomeLimpo) throw new Error("Informe o nome da empresa.");
      const dominioLimpo = dominio.trim();
      await createCompany({ nome: nomeLimpo, dominio: dominioLimpo || null, usuarioId: user.id });
    },
    onSuccess: async () => {
      setNome("");
      setDominio("");
      await refreshEmpresa();
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (invite: CompanyInvite) => {
      await acceptInvite({ empresaId: invite.empresa_id, token: invite.token });
    },
    onSuccess: async () => {
      await refreshEmpresa();
      invitesQuery.refetch();
    },
  });

  if (empresaId) {
    return <Navigate to="/" replace />;
  }

  const hasInvites = (invitesQuery.data ?? []).length > 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-12">
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ShieldPlus className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold">Bem-vindo ao Gestor Motors</h1>
        <p className="text-sm text-muted-foreground">
          Para iniciar, crie a empresa que voce vai gerenciar ou aceite um convite existente.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Registrar nova empresa</CardTitle>
            <CardDescription>
              Define o espaco da sua empresa dentro da plataforma multi-tenant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                createMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="nome-empresa">
                  Nome da empresa
                </label>
                <input
                  id="nome-empresa"
                  required
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                  placeholder="Ex: Supra Motors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="dominio-empresa">
                  Dominio (opcional)
                </label>
                <input
                  id="dominio-empresa"
                  type="text"
                  value={dominio}
                  onChange={(event) => setDominio(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                  placeholder="minhaempresa.com.br"
                />
              </div>

              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Criando empresa..." : "Criar empresa"}
              </Button>
              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  {(createMutation.error as Error)?.message ?? "Nao foi possivel criar a empresa."}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Convites recebidos</CardTitle>
            <CardDescription>
              Se voce foi convidado para uma empresa existente, aceite abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitesQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : !hasInvites ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                <Clock className="h-6 w-6" />
                Nenhum convite encontrado. Aguarde um administrador te adicionar ou crie uma nova empresa.
              </div>
            ) : (
              <div className="space-y-3">
                {(invitesQuery.data ?? []).map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        {invite.empresas?.nome ?? "Empresa"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Convite expira em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(invite.expira_em))}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={acceptMutation.isPending}
                      onClick={() => acceptMutation.mutate(invite)}
                    >
                      {acceptMutation.isPending ? "Processando..." : "Aceitar"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {acceptMutation.isError && (
              <p className="text-sm text-destructive">
                {(acceptMutation.error as Error)?.message ?? "Nao foi possivel aceitar o convite."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
