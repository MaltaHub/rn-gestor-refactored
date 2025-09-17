import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { TrendingUp, DollarSign, Users } from "lucide-react";

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

type VendaRecord = TableRow<"vendas">

async function fetchVendas(empresaId: string) {
  const { data, error } = await supabase
    .from("vendas")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("data_venda", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data satisfies VendaRecord[];
}

export default function Vendas() {
  const navigate = useNavigate();
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);
  const empresaId = useAuthStore((state) => state.empresaId);

  const vendasQuery = useQuery({
    queryKey: ["vendas", empresaId],
    queryFn: () => fetchVendas(empresaId!),
    enabled: Boolean(empresaId),
  });

  const stats = useMemo(() => {
    const data = vendasQuery.data ?? [];
    if (data.length === 0) {
      return {
        total: 0,
        volume: 0,
        ticket: 0,
        financiados: 0,
      };
    }

    const volume = data.reduce((acc, venda) => acc + venda.preco_venda, 0);
    const financiados = data.filter((venda) => venda.forma_pagamento === "financiamento").length;

    return {
      total: data.length,
      volume,
      ticket: volume / data.length,
      financiados,
    };
  }, [vendasQuery.data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-muted-foreground">
            Monitore resultados comerciais e acompanhe indicadores de performance.
          </p>
        </div>
        <Button variant="hero" size="lg" onClick={() => setShowRegisterPanel((state) => !state)}>
          {showRegisterPanel ? "Fechar painel" : "Registrar venda"}
        </Button>
      </div>

      {showRegisterPanel && (

        <Card className="shadow-card">

          <CardHeader>

            <CardTitle>Registrar nova venda</CardTitle>

            <CardDescription>Selecione o veiculo e defina os dados financeiros para concluir a venda.</CardDescription>

          </CardHeader>

          <CardContent className="space-y-3">

            <p className="text-sm text-muted-foreground">Acesse o modulo de estoque para escolher o veiculo e acompanhe a documentacao antes da finalizacao.</p>

            <div className="flex flex-wrap gap-2">

              <Button variant="outline" onClick={() => navigate('/app/estoque')}>Abrir estoque</Button>

              <Button variant="ghost" onClick={() => navigate('/documentacao')}>Ver documentacao</Button>

            </div>

          </CardContent>

        </Card>

      )}



      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total de vendas" value={stats.total} helper="Negocios realizados" icon={<TrendingUp className="h-5 w-5 text-success" />} />
        <MetricCard title="Volume" value={stats.volume} helper="Valor total" icon={<DollarSign className="h-5 w-5 text-primary" />} isCurrency />
        <MetricCard title="Ticket medio" value={stats.ticket} helper="Valor medio" icon={<DollarSign className="h-5 w-5 text-warning" />} isCurrency />
        <MetricCard title="Financiadas" value={stats.financiados} helper="Via bancos" icon={<Users className="h-5 w-5 text-info" />} />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Historico recente</CardTitle>
          <CardDescription>Ultimas vendas registradas na empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          {vendasQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : vendasQuery.data && vendasQuery.data.length > 0 ? (
            <div className="space-y-3">
              {vendasQuery.data.map((venda) => (
                <Card key={venda.id} className="border border-border/80 shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {venda.status_venda}
                      </p>
                      <h3 className="text-base font-bold">{venda.cliente_nome}</h3>
                      <p className="text-xs text-muted-foreground">
                        Registrado por {venda.criado_por} em
                        {" "}
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short",
                        }).format(new Date(venda.data_venda))}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Valor: {venda.preco_venda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                      {venda.valor_financiado && (
                        <span>
                          Financiado: {venda.valor_financiado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      )}
                      {venda.numero_parcelas && <span>Parcelas: {venda.numero_parcelas}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
              <TrendingUp className="h-10 w-10" />
              <p className="font-semibold text-foreground">Nenhuma venda registrada</p>
              <p className="text-sm">Registre uma nova venda para acompanhar os indicadores.</p>
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
  isCurrency?: boolean;
}

function MetricCard({ title, value, helper, icon, isCurrency }: MetricCardProps) {
  const formatted = isCurrency
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : value.toLocaleString("pt-BR");

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
        <div className="text-2xl font-bold">{formatted}</div>
      </CardContent>
    </Card>
  );
}



