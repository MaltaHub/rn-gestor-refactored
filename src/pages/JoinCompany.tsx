import { useMemo } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"
import { acceptInvite } from "@/services/empresa"
import { useAuthStore } from "@/store/authStore"

interface InviteByToken {
  id: string
  empresa_id: string
  status: string | null
  expira_em: string
  consumido_em: string | null
  empresas: { nome: string } | null
}

export function JoinCompany() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user, loading, refreshEmpresa } = useAuthStore()

  const inviteQuery = useQuery({
    queryKey: ["company-invite-token", token],
    queryFn: async () => {
      const inviteToken = token ?? ""
      if (!inviteToken) throw new Error("Token do convite ausente.")

      const { data, error } = await supabase
        .from("convites_empresa")
        .select("id, empresa_id, status, expira_em, consumido_em, empresas ( nome )")
        .eq("token", inviteToken)
        .maybeSingle<InviteByToken>()

      if (error) throw error
      if (!data) throw new Error("Convite nao encontrado.")
      return data
    },
    enabled: Boolean(token && user),
    retry: 1,
  })

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const invite = inviteQuery.data
      if (!token || !invite) throw new Error("Convite invalido.")
      await acceptInvite({ empresaId: invite.empresa_id, token })
      await refreshEmpresa()
    },
    onSuccess: () => {
      navigate("/app", { replace: true })
    },
  })

  const invite = inviteQuery.data

  const isExpired = useMemo(() => {
    if (!invite) return false
    const expiry = new Date(invite.expira_em)
    return Number.isFinite(expiry.valueOf()) && expiry.getTime() < Date.now()
  }, [invite])

  const isConsumed = Boolean(invite?.consumido_em) || invite?.status === "consumido"
  const inviteUnavailable = !invite || isExpired || isConsumed

  if (!token) {
    return <ErrorState title="Convite invalido" message="O token informado esta ausente ou invalido." />
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Validando convite...
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `/convites/${token}` }} />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-lg shadow-card">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">Aceitar convite</CardTitle>
          <CardDescription>
            Confirme o ingresso na empresa convidante para acessar o painel compartilhado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {inviteQuery.isError ? (
            <ErrorState title="Nao foi possivel carregar o convite" message={(inviteQuery.error as Error).message} />
          ) : inviteQuery.isLoading ? (
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando informacoes do convite...
            </div>
          ) : inviteUnavailable ? (
            <ErrorState
              title="Convite indisponivel"
              message={
                isExpired
                  ? "Este convite expirou. Solicite um novo convite ao administrador da empresa."
                  : "Este convite ja foi utilizado."
              }
            />
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="text-lg font-semibold text-foreground">
                  {invite.empresas?.nome ?? "Empresa convidante"}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Expira em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(invite.expira_em))}
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending}>
                {acceptMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processando convite
                  </span>
                ) : (
                  "Aceitar convite"
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                Ao aceitar, sua conta sera vinculada a esta empresa e voce tera acesso aos estoques e fluxos compartilhados no Gestor Motors.
              </p>
            </div>
          )}

          {acceptMutation.isError && (
            <ErrorState title="Erro ao aceitar convite" message={(acceptMutation.error as Error).message} />
          )}

          {acceptMutation.isSuccess && !acceptMutation.isPending && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-sm text-primary">
              <CheckCircle className="h-5 w-5" /> Convite aceito com sucesso. Redirecionando para o painel...
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center text-sm text-destructive">
      <XCircle className="h-10 w-10" />
      <div>
        <p className="font-semibold text-destructive-foreground">{title}</p>
        <p className="text-destructive/80">{message}</p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <a href="/setup/empresa">Criar nova empresa</a>
      </Button>
    </div>
  )
}

export default JoinCompany
