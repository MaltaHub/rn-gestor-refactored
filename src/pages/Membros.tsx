import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Users, UserPlus, Shield, ShieldAlert } from "lucide-react";

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
import type { TableRow, Enums } from "@/types";
import { inviteMember } from "@/services/empresa";

interface MembroRecord extends TableRow<"membros_empresa"> {}

const PAPEL_OPTIONS: Enums["papel_usuario_empresa"][] = [
  "proprietario",
  "administrador",
  "gerente",
  "consultor",
  "usuario",
];

async function fetchMembros(empresaId: string) {
  const { data, error } = await supabase
    .from("membros_empresa")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("criado_em", { ascending: true });

  if (error) throw error;
  return data satisfies MembroRecord[];
}

export default function Membros() {
  const empresaId = useAuthStore((state) => state.empresaId);
  const user = useAuthStore((state) => state.user);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Enums["papel_usuario_empresa"]>("usuario");

  const membrosQuery = useQuery({
    queryKey: ["membros", empresaId],
    queryFn: () => fetchMembros(empresaId!),
    enabled: Boolean(empresaId),
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!empresaId) throw new Error("Empresa nao encontrada para convite.");
      if (!user) throw new Error("Usuario nao autenticado.");
      const emailLimpo = inviteEmail.trim();
      if (!emailLimpo) throw new Error("Informe o email do colaborador.");
      await inviteMember({
        empresaId,
        email: emailLimpo,
        papel: inviteRole,
        convidadoPor: user.id,
      });
    },
    onSuccess: () => {
      setInviteEmail("");
      setInviteRole("usuario");
      setShowInviteForm(false);
    },
  });

  useEffect(() => {
    if (!showInviteForm) {
      inviteMutation.reset();
    }
  }, [showInviteForm, inviteMutation]);

  const stats = useMemo(() => {
    const data = membrosQuery.data ?? [];
    if (data.length === 0) {
      return {
        total: 0,
        ativos: 0,
        proprietarios: 0,
      };
    }

    const ativos = data.filter((item) => item.ativo !== false).length;
    const proprietarios = data.filter((item) => item.papel === "proprietario").length;

    return { total: data.length, ativos, proprietarios };
  }, [membrosQuery.data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipe</h1>
          <p className="text-muted-foreground">
            Controle os usuarios com acesso ao portal corporativo e seus papeis.
          </p>
        </div>
        <Button variant="hero" size="lg">
          Convidar membro
        </Button>
      </div>

      {showInviteForm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Enviar convite</CardTitle>
            <CardDescription>Convidar um colaborador para acessar a empresa.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                inviteMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="invite-email">
                  Email do colaborador
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                  placeholder="colaborador@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="invite-role">
                  Papel na empresa
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as Enums["papel_usuario_empresa"])}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm capitalize"
                >
                  {PAPEL_OPTIONS.map((papel) => (
                    <option key={papel} value={papel}>
                      {papel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowInviteForm(false)}>
                  Fechar
                </Button>
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? "Enviando..." : "Enviar convite"}
                </Button>
              </div>
            </form>
            {inviteMutation.isError && (
              <p className="mt-3 text-sm text-destructive">
                {(inviteMutation.error as Error)?.message ?? "Nao foi possivel enviar o convite."}
              </p>
            )}
            {inviteMutation.isSuccess && (
              <p className="mt-3 text-sm text-success">Convite enviado com sucesso.</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Total"
          value={stats.total}
          helper="Usuarios cadastrados"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Ativos"
          value={stats.ativos}
          helper="Com acesso liberado"
          icon={<Shield className="h-5 w-5 text-success" />}
        />
        <MetricCard
          title="Proprietarios"
          value={stats.proprietarios}
          helper="Nivel maximo de acesso"
          icon={<ShieldAlert className="h-5 w-5 text-warning" />}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Membros da empresa</CardTitle>
          <CardDescription>Lista de usuarios habilitados com seus papeis e status.</CardDescription>
        </CardHeader>
        <CardContent>
          {membrosQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : membrosQuery.data && membrosQuery.data.length > 0 ? (
            <div className="space-y-3">
              {membrosQuery.data.map((membro) => (
                <Card key={membro.id} className="border border-border/80 shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {membro.papel}
                      </p>
                      <h3 className="text-base font-bold">{membro.usuario_id}</h3>
                      <p className="text-xs text-muted-foreground">
                        Desde {membro.criado_em ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(membro.criado_em)) : "data nao informada"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-4 py-1 text-xs font-semibold ${
                        membro.ativo !== false
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {membro.ativo !== false ? "Ativo" : "Inativo"}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
              <UserPlus className="h-10 w-10" />
              <p className="font-semibold text-foreground">Nenhum membro cadastrado</p>
              <p className="text-sm">Convide usuarios para comecar a montar a equipe.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  helper: string;
  icon: ReactNode;
}

function MetricCard({ title, value, helper, icon }: MetricCardProps) {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <CardDescription>{helper}</CardDescription>
        </div>
        <span className="rounded-full bg-muted p-2">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}


