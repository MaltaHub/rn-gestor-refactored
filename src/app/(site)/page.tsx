import Link from "next/link";
import { ArrowRight, CheckCircle, PanelsTopLeft } from "lucide-react";

import { StandardLayout } from "@/components/layout/standard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { coreModules, operationalHighlights, quantitativeProofPoints } from "@/data/modules";

const differentiators = [
  "Arquitetura Next.js App Router com foco em performance edge.",
  "Componentes tipados, leves e orientados a ações do negócio.",
  "Design austero, pronto para suportar governança e auditoria."
];

export default function LandingPage() {
  return (
    <StandardLayout className="gap-24">
      <section className="flex flex-col gap-16 lg:flex-row lg:items-center" id="hero">
        <div className="flex-1 space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
            Cockpit holístico para o negócio automotivo
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Simplicidade estratégica para acelerar estoque, anúncios e vendas em um único fluxo.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Uma base Next.js minimalista, comentada e pronta para receber autenticação, integrações e automações sem
            sacrificar a austeridade da operação.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/app">
              <Button size="lg" className="gap-3">
                Explorar cockpit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-200 hover:text-sky-100"
            >
              Validar fluxo de login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            {differentiators.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-sky-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Card className="flex w-full max-w-md flex-col gap-6 border-white/10 bg-slate-900/60 p-8">
          <CardHeader className="gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-100">
              <PanelsTopLeft className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <CardTitle>Camadas prontas</CardTitle>
              <CardDescription>
                Comentários `action` sinalizam precisamente onde conectar serviços, mantendo o código limpo e evolutivo.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-3">
            {quantitativeProofPoints.map(({ label, value, description }) => (
              <div key={label} className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="solucoes" className="space-y-10">
        <div className="space-y-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Soluções</span>
          <h2 className="text-3xl font-semibold text-white">Efetividade operando com simplicidade</h2>
          <p className="mx-auto max-w-3xl text-sm text-slate-400">
            Cada módulo é uma peça de um ecossistema holístico. A interface já respeita hierarquias de decisão e deixa
            claro onde integrar serviços, métricas e conformidade.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {operationalHighlights.map(({ title, description }) => (
            <Card key={title} className="border-white/10 bg-slate-900/70">
              <CardHeader className="gap-3">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="modulos" className="space-y-10">
        <div className="space-y-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Módulos principais</span>
          <h2 className="text-3xl font-semibold text-white">Fluxos conectados ponta a ponta</h2>
          <p className="mx-auto max-w-3xl text-sm text-slate-400">
            A navegação interna herda estes mesmos módulos, garantindo coerência e clareza entre a visão de negócio e a
            execução digital.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {coreModules.map(({ slug, name, summary, highlight, href, icon: Icon }) => (
            <Card key={slug} className="border-white/10 bg-slate-900/70">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{name}</CardTitle>
                  <CardDescription>{summary}</CardDescription>
                </div>
                <span className="rounded-full bg-sky-500/10 p-3 text-sky-200">
                  <Icon className="h-5 w-5" />
                </span>
              </CardHeader>
              <CardContent className="gap-4">
                {highlight ? <p className="text-xs text-slate-400">{highlight}</p> : null}
                <Link
                  href={href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-200 hover:text-sky-100"
                >
                  Abrir módulo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="operacao" className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-white/5 bg-slate-900/80 p-8">
          <CardHeader className="gap-3">
            <CardTitle className="text-2xl">Operação sustentada</CardTitle>
            <CardDescription>
              Mapeamento de jornadas, placeholders de integrações e governança incorporada desde o design.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 text-sm text-slate-300">
            <p>
              O cockpit foi concebido para times que precisam de foco: informações circulam em painéis diretos,
              comentários orientam automações e toda a estrutura está pronta para receber lógica de negócio.
            </p>
            <p>
              Sem sobrecarga visual ou dependência de um backend específico, você conecta seus serviços preferidos, seja
              um BFF próprio, Supabase, ou funções serverless.
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-slate-900/80 p-8">
          <CardHeader className="gap-3">
            <CardTitle>Próximo passo</CardTitle>
            <CardDescription>
              Inicie pelo módulo de estoque ou configure autenticação no login. Tudo já tipado e comentado.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3 text-sm text-slate-300">
            <p>
              Os pontos de integração aparecem como comentários `action`, mantendo o código limpo para evoluções
              incrementais.
            </p>
            <Link
              href="/app/estoque"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-200 hover:text-sky-100"
            >
              Ver gestão de estoque
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </StandardLayout>
  );
}
