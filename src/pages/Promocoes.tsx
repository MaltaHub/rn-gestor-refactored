import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Gift, Timer, Flame } from "lucide-react";

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
import type { TableRow } from "@/types";

interface PromocaoRecord extends TableRow<"promocoes"> {}

async function fetchPromocoes(empresaId: string) {
  const { data, error } = await supabase
    .from("promocoes")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("criado_em", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data satisfies PromocaoRecord[];
}

export default function Promocoes() {
  const navigate = useNavigate();
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const empresaId = useAuthStore((state) => state.empresaId);

  const promocoesQuery = useQuery({
    queryKey: ["promocoes", empresaId],
    queryFn: () => fetchPromocoes(empresaId!),
    enabled: Boolean(empresaId),
  });

  const stats = useMemo(() => {
    const data = promocoesQuery.data ?? [];
    if (data.length === 0) {
      return {
        total: 0,
        ativas: 0,
        emBreve: 0,
      };
    }

    const now = new Date();
    const ativas = data.filter((item) => {
      const inicio = new Date(item.data_inicio);
      const fim = item.data_fim ? new Date(item.data_fim) : null;
      const ativa = inicio <= now && (!fim || fim >= now);
      return ativa && item.ativo !== false;
    }).length;

    const emBreve = data.filter((item) => new Date(item.data_inicio) > now).length;

    return { total: data.length, ativas, emBreve };
  }, [promocoesQuery.data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promocoes</h1>
          <p className="text-muted-foreground">
            Crie campanhas e acompanhe resultados promocionais em tempo real.
          </p>
        </div>
        <Button variant="hero" size="lg">
          Nova promocao
        </Button>
      </div>

      {showCreatePanel && (

        <Card className="shadow-card">

          <CardHeader>

            <CardTitle>Criar promocao</CardTitle>

            <CardDescription>Defina o periodo e o preco promocional dos veiculos selecionados.</CardDescription>

          </CardHeader>

          <CardContent className="space-y-3">

            <p className="text-sm text-muted-foreground">Utilize esse fluxo para destacar veiculos com valores especiais e acompanhar o desempenho.</p>

            <div className="flex flex-wrap gap-2">

              <Button variant="outline" onClick={() => navigate('/estoque')}>Selecionar veiculos</Button>

              <Button variant="ghost" onClick={() => setShowCreatePanel(false)}>Entendi</Button>

            </div>

          </CardContent>

        </Card>

      )}



      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Total"
          value={stats.total}
          helper="Campanhas cadastradas"
          icon={<Gift className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Ativas"
          value={stats.ativas}
          helper="Rodando neste momento"
          icon={<Flame className="h-5 w-5 text-success" />}
        />
        <MetricCard
          title="Em breve"
          value={stats.emBreve}
          helper="Programadas para iniciar"
          icon={<Timer className="h-5 w-5 text-warning" />}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>Controle de promocoes por periodo e preco especial.</CardDescription>
        </CardHeader>
        <CardContent>
          {promocoesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : promocoesQuery.data && promocoesQuery.data.length > 0 ? (
            <div className="space-y-3">
              {promocoesQuery.data.map((promocao) => (
                <Card key={promocao.id} className="border border-border/80 shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {promocao.tipo_promocao}
                      </p>
                      <h3 className="text-base font-bold">{promocao.preco_promocional.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</h3>
                      <p className="text-xs text-muted-foreground">
                        Vigencia de {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(promocao.data_inicio))}
                        {promocao.data_fim && ` ate ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(promocao.data_fim))}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Autor: {promocao.autor_id}</span>
                      <span>Status: {promocao.ativo ? "Ativa" : "Inativa"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
              <Gift className="h-10 w-10" />
              <p className="font-semibold text-foreground">Nenhuma promocao cadastrada</p>
              <p className="text-sm">Inicie uma campanha para destacar veiculos estrategicos.</p>
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


