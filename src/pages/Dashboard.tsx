import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Megaphone,
  TrendingUp,
  BarChart3,
  Plus,
  ArrowRight,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

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

interface DashboardData {
  vehiclesCount: number;
  anunciosCount: number;
  vendasCount: number;
  promocoesAtivas: number;
  recentVehicles: Array<{
    id: string;
    placa: string;
    cor: string;
    estado_venda: string;
    registrado_em: string;
  }>;
}

async function fetchDashboard(empresaId: string): Promise<DashboardData> {
  const [vehiclesCountRes, anunciosCountRes, vendasCountRes, promocoesCountRes, recentVehiclesRes] =
    await Promise.all([
      supabase
        .from("veiculos")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId),
      supabase
        .from("anuncios")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId),
      supabase
        .from("vendas")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId),
      supabase
        .from("promocoes")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .eq("ativo", true),
      supabase
        .from("veiculos")
        .select("id, placa, cor, estado_venda, registrado_em")
        .eq("empresa_id", empresaId)
        .order("registrado_em", { ascending: false })
        .limit(6),
    ]);

  if (
    vehiclesCountRes.error ||
    anunciosCountRes.error ||
    vendasCountRes.error ||
    promocoesCountRes.error ||
    recentVehiclesRes.error
  ) {
    const error =
      vehiclesCountRes.error ||
      anunciosCountRes.error ||
      vendasCountRes.error ||
      promocoesCountRes.error ||
      recentVehiclesRes.error;
    throw error;
  }

  return {
    vehiclesCount: vehiclesCountRes.count ?? 0,
    anunciosCount: anunciosCountRes.count ?? 0,
    vendasCount: vendasCountRes.count ?? 0,
    promocoesAtivas: promocoesCountRes.count ?? 0,
    recentVehicles: recentVehiclesRes.data ?? [],
  };
}

export function Dashboard() {
  const empresaId = useAuthStore((state) => state.empresaId);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard", empresaId],
    queryFn: () => fetchDashboard(empresaId!),
    enabled: Boolean(empresaId),
  });

  const recentVehicles = useMemo(() => data?.recentVehicles ?? [], [data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, {user?.email ?? "gestor"}</h1>
          <p className="text-muted-foreground">
            Visao consolidada da operacao da sua empresa.
          </p>
        </div>
        <div className="flex flex-wrap justify-start gap-3">
          <Button variant="hero" size="lg" onClick={() => navigate('/estoque', { state: { openCreate: true } })}>
            <Plus className="mr-2 h-4 w-4" />
            Novo veiculo
          </Button>
          <Button variant="outline" size="lg" onClick={() => refetch()}>
            Atualizar dados
          </Button>
        </div>
      </div>

      {isError && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Nao foi possivel carregar o painel
            </CardTitle>
            <CardDescription className="text-destructive">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Package className="h-5 w-5 text-primary" />}
          title="Veiculos em estoque"
          value={data?.vehiclesCount ?? 0}
          helper="Total dentro da empresa"
          loading={isLoading}
        />
        <MetricCard
          icon={<Megaphone className="h-5 w-5 text-info" />}
          title="Anuncios ativos"
          value={data?.anunciosCount ?? 0}
          helper="Sincronizados nas plataformas"
          loading={isLoading}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          title="Vendas do mes"
          value={data?.vendasCount ?? 0}
          helper="Registradas no periodo"
          loading={isLoading}
        />
        <MetricCard
          icon={<BarChart3 className="h-5 w-5 text-warning" />}
          title="Promocoes ativas"
          value={data?.promocoesAtivas ?? 0}
          helper="Campanhas em andamento"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Ultimos veiculos cadastrados</CardTitle>
              <CardDescription>
                Cadastros recentes ordenados por data de registro.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/estoque')}>
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : recentVehicles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum veiculo cadastrado recentemente.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentVehicles.map((vehicle) => (
                  <li
                    key={vehicle.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide">
                        {vehicle.placa}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.cor} - {vehicle.estado_venda}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "medium",
                      }).format(new Date(vehicle.registrado_em))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Checklist rapido</CardTitle>
            <CardDescription>
              Acompanhe pendencias criticas na operacao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChecklistItem
              icon={<ClipboardList className="h-4 w-4 text-warning" />}
              title="Documentacao pendente"
              description="Revise processos que estao aguardando aprovacao."
            />
            <ChecklistItem
              icon={<ShieldCheck className="h-4 w-4 text-success" />}
              title="Revisar promocoes"
              description="Garanta que campanhas estejam dentro do prazo."
            />
            <ChecklistItem
              icon={<TrendingUp className="h-4 w-4 text-info" />}
              title="Metas de vendas"
              description="Compare o resultado com a meta mensal definida."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <QuickAction
          title="Gestao de estoque"
          description="Cadastre veiculos e controle disponibilidade."
          icon={<Package className="h-5 w-5 text-primary" />}
          onClick={() => navigate('/estoque')}
        />
        <QuickAction
          title="Gestao de anuncios"
          description="Gerencie integracao com marketplaces e portais."
          icon={<Megaphone className="h-5 w-5 text-info" />}
          onClick={() => navigate('/anuncios')}
        />
        <QuickAction
          title="Gestao de vendas"
          description="Registre propostas, negociacoes e contratos."
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          onClick={() => navigate('/vendas')}
        />
        <QuickAction
          title="Relatorios"
          description="Acompanhe indicadores de desempenho em tempo real."
          icon={<BarChart3 className="h-5 w-5 text-warning" />}
          onClick={() => navigate('/documentacao')}
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  helper: string;
  loading?: boolean;
  icon: ReactNode;
}

function MetricCard({ title, value, helper, loading, icon }: MetricCardProps) {
  return (
    <Card className="shadow-card transition-all hover:shadow-dropdown">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

interface ChecklistItemProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function ChecklistItem({ icon, title, description }: ChecklistItemProps) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-background/60 p-3">
      <div className="rounded-full bg-muted p-2">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
}

function QuickAction({ title, description, icon, onClick }: QuickActionProps) {
  return (
    <Card className="shadow-card transition-all hover:shadow-dropdown">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="rounded-full bg-primary/10 p-2 text-primary">{icon}</span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" className="gap-1" onClick={onClick}>
          Acessar modulo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}



