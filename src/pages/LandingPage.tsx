import { Navigate } from "react-router-dom"
import { ArrowRight, Building2, Car, Megaphone, ShieldCheck, TrendingUp, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"

const FEATURES = [
  {
    icon: <Car className="h-8 w-8 text-primary" />, 
    title: "Gestão de estoque",
    description: "Controle completo do ciclo de vida dos veículos, da entrada à venda."
  },
  {
    icon: <Megaphone className="h-8 w-8 text-info" />,
    title: "Publicação de anúncios",
    description: "Centralize campanhas e acompanhe métricas de performance por plataforma."
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-success" />,
    title: "Monitoramento de vendas",
    description: "Visualize resultados em tempo real e identifique oportunidades de receita."
  },
]

const HIGHLIGHTS = [
  { label: "Veículos gerenciados", value: "245+" },
  { label: "Portais integrados", value: "08" },
  { label: "Membros conectados", value: "120" },
]

export function LandingPage() {
  const user = useAuthStore((state) => state.user)

  if (user) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/60">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="h-6 w-6" />
            <div>
              <p className="text-base font-semibold">Gestor Motors</p>
              <p className="text-xs text-muted-foreground">Plataforma corporativa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <a href="/login" className="text-sm font-medium">Entrar</a>
            </Button>
            <Button asChild variant="hero">
              <a href="/login" className="text-sm font-semibold">
                Acessar painel
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-background px-4 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" />
                Plataforma multi-tenant pronta para operação
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Gestão integrada de estoque, anúncios e vendas
                </h1>
                <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                  O Gestor Motors reúne os fluxos corporativos essenciais da referência <span className="font-semibold">rn-gestor-auto</span> em uma experiência web adaptada para times de vendas, marketing e operações.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="hero">
                  <a href="/login" className="text-base font-semibold">
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="/login" className="text-base font-semibold">Falar com vendas</a>
                </Button>
              </div>

              <dl className="grid gap-6 pt-6 sm:grid-cols-3">
                {HIGHLIGHTS.map((highlight) => (
                  <div key={highlight.label} className="rounded-2xl border border-border/60 bg-background/60 p-4 text-center">
                    <dt className="text-sm text-muted-foreground">{highlight.label}</dt>
                    <dd className="mt-1 text-2xl font-bold text-foreground">{highlight.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Card className="border-0 bg-background/70 shadow-card backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg font-semibold text-muted-foreground">
                  Fluxos disponíveis no painel
                </CardTitle>
                <CardDescription>
                  Um resumo das áreas já adaptadas do produto original para esta arquitetura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                      <LayoutPreviewIcon />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Dashboard operacional</p>
                      <p>Indicadores consolidados de estoque, campanhas e vendas.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-info/10 p-2 text-info">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Gestão de anúncios</p>
                      <p>Configuração de plataformas e acompanhamento de desempenho.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-success/10 p-2 text-success">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Operação multi-loja</p>
                      <p>Contexto compartilhado de lojas, convites e onboarding de times.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl space-y-12">
            <header className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Recursos centrais</p>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Uma base sólida para replicar o rn-gestor-auto na web
              </h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                Os módulos abaixo já estão estruturados na aplicação, prontos para receber as integrações e regras de negócio do projeto original.
              </p>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="border border-border/60 bg-background/80 shadow-card transition hover:shadow-dropdown">
                  <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>
                      A arquitetura atual mantém providers de sessão, layout autenticado e páginas dedicadas para estes processos, facilitando a migração incremental.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>Gestor Motors • Plataforma administrativa</span>
          </div>
          <p>Baseado no legado do projeto rn-gestor-auto.</p>
        </div>
      </footer>
    </div>
  )
}

function LayoutPreviewIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" className="opacity-40" />
      <path d="M3 10h18" className="opacity-70" />
      <path d="M9 10v10" className="opacity-70" />
    </svg>
  )
}

export default LandingPage
