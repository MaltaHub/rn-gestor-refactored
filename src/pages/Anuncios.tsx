import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Megaphone, SignalHigh, SignalLow } from "lucide-react";

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

interface AnuncioRecord extends TableRow<"anuncios"> {}
type PlataformaOption = { id: string; nome: string };

async function fetchAnuncios(empresaId: string) {
  const { data, error } = await supabase
    .from("anuncios")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("criado_em", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data satisfies AnuncioRecord[];
}

async function fetchPlataformas(empresaId: string): Promise<PlataformaOption[]> {
  const { data, error } = await supabase
    .from("plataformas")
    .select("id, nome")
    .eq("empresa_id", empresaId)
    .order("nome", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((item) => ({
    id: item.id,
    nome: item.nome,
  }));
}
export default function Anuncios() {
  const navigate = useNavigate();
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const empresaId = useAuthStore((state) => state.empresaId);

  const anunciosQuery = useQuery({
    queryKey: ["anuncios", empresaId],
    queryFn: () => fetchAnuncios(empresaId!),
    enabled: Boolean(empresaId),
  });

  const plataformasQuery = useQuery({
    queryKey: ["plataformas", empresaId],
    queryFn: () => fetchPlataformas(empresaId!),
    enabled: Boolean(empresaId),
  });

  const stats = useMemo(() => {
    const data = anunciosQuery.data ?? [];
    if (data.length === 0) {
      return {
        total: 0,
        ativos: 0,
        expirados: 0,
      };
    }

    const ativos = data.filter((item) => item.status === "ativo").length;
    const expirados = data.filter((item) => item.status === "expirado").length;

    return {
      total: data.length,
      ativos,
      expirados,
    };
  }, [anunciosQuery.data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Anuncios</h1>
          <p className="text-muted-foreground">
            Centralize a gestao dos anuncios publicados nas plataformas digitais.
          </p>
        </div>
        <Button variant="hero" size="lg" onClick={() => setShowCreatePanel((state) => !state)}>
          {showCreatePanel ? "Fechar painel" : "Criar anuncio"}
        </Button>
      </div>

      {showCreatePanel && (

        <Card className="shadow-card">

          <CardHeader>

            <CardTitle>Novo anuncio</CardTitle>

            <CardDescription>Defina os passos iniciais para publicar um anuncio.</CardDescription>

          </CardHeader>

          <CardContent className="space-y-3">

            <p className="text-sm text-muted-foreground">Os anuncios sao criados a partir dos veiculos cadastrados. Configure as plataformas e finalize a publicacao.</p>

            <div className="flex flex-wrap gap-2">

              <Button variant="outline" onClick={() => navigate('/estoque')}>Ir para estoque</Button>

              <Button variant="ghost" onClick={() => setShowCreatePanel(false)}>Concluir</Button>

            </div>

          </CardContent>

        </Card>

      )}



      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total" value={stats.total} helper="Anuncios cadastrados" icon={<Megaphone className="h-5 w-5 text-primary" />} />
        <MetricCard title="Ativos" value={stats.ativos} helper="Publicados agora" icon={<SignalHigh className="h-5 w-5 text-success" />} />
        <MetricCard title="Expirados" value={stats.expirados} helper="Necessitam revisao" icon={<SignalLow className="h-5 w-5 text-warning" />} />
        <MetricCard
          title="Plataformas"
          value={plataformasQuery.data?.length ?? 0}
          helper="Integracoes ativas"
          icon={<Megaphone className="h-5 w-5 text-info" />}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Anuncios recentes</CardTitle>
          <CardDescription>Ultimos anuncios cadastrados ou atualizados.</CardDescription>
        </CardHeader>
        <CardContent>
          {anunciosQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : anunciosQuery.data && anunciosQuery.data.length > 0 ? (
            <div className="space-y-3">
              {anunciosQuery.data.map((anuncio) => {
                const plataforma = plataformasQuery.data?.find((item) => item.id === anuncio.plataforma_id);
                return (
                  <Card key={anuncio.id} className="border border-border/80 shadow-sm">
                    <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {anuncio.status ?? "sem status"}
                        </p>
                        <h3 className="text-base font-bold">{anuncio.titulo}</h3>
                        <p className="text-xs text-muted-foreground">
                          Plataforma: {plataforma?.nome ?? anuncio.plataforma_id}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>Visualizacoes: {anuncio.visualizacoes ?? 0}</span>
                        <span>Favoritos: {anuncio.favoritos ?? 0}</span>
                        <span>Mensagens: {anuncio.mensagens ?? 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
              <Megaphone className="h-10 w-10" />
              <p className="font-semibold text-foreground">Nenhum anuncio cadastrado</p>
              <p className="text-sm">Publique anuncios para visualizar estatisticas e desempenho.</p>
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






