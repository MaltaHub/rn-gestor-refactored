import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Store } from "lucide-react";

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

type LojaRecord = TableRow<"lojas">
type LocalRecord = TableRow<"locais">

async function fetchLojas(empresaId: string) {
  const { data, error } = await supabase
    .from("lojas")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data satisfies LojaRecord[];
}

async function fetchLocais(empresaId: string) {
  const { data, error } = await supabase
    .from("locais")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data satisfies LocalRecord[];
}

export default function Lojas() {
  const empresaId = useAuthStore((state) => state.empresaId);
  const navigate = useNavigate();
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  const lojasQuery = useQuery({
    queryKey: ["lojas", empresaId],
    queryFn: () => fetchLojas(empresaId!),
    enabled: Boolean(empresaId),
  });

  const locaisQuery = useQuery({
    queryKey: ["locais", empresaId],
    queryFn: () => fetchLocais(empresaId!),
    enabled: Boolean(empresaId),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lojas e locais</h1>
          <p className="text-muted-foreground">
            Configure pontos fisicos da operacao e acompanhe distribuicao de estoque.
          </p>
        </div>
        <Button variant="hero" size="lg" onClick={() => setShowCreatePanel((state) => !state)}>
          {showCreatePanel ? "Fechar painel" : "Nova loja"}
        </Button>
      </div>

      {showCreatePanel && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Cadastrar loja</CardTitle>
            <CardDescription>Crie uma nova unidade para organizar a operacao.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">O cadastro de lojas e realizado pelo time administrador. Garanta que a empresa esteja configurada e utilize o canal de suporte para ativar novos pontos.</p>
            <Button variant="outline" onClick={() => navigate('/setup/empresa')}>Configurar empresa</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Lojas"
          value={lojasQuery.data?.length ?? 0}
          helper="Unidades comerciais"
          icon={<Store className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Locais"
          value={locaisQuery.data?.length ?? 0}
          helper="Areas operacionais"
          icon={<MapPin className="h-5 w-5 text-info" />}
        />
        <MetricCard
          title="Media por loja"
          value={locaisQuery.data && lojasQuery.data && lojasQuery.data.length > 0 ? Math.ceil(locaisQuery.data.length / lojasQuery.data.length) : 0}
          helper="Locais associados"
          icon={<Building2 className="h-5 w-5 text-success" />}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lojas cadastradas</CardTitle>
          <CardDescription>Estrutura fisica da empresa por unidade.</CardDescription>
        </CardHeader>
        <CardContent>
          {lojasQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : lojasQuery.data && lojasQuery.data.length > 0 ? (
            <div className="space-y-3">
              {lojasQuery.data.map((loja) => (
                <Card key={loja.id} className="border border-border/80 shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-base font-bold">{loja.nome}</h3>
                      <p className="text-xs text-muted-foreground">ID: {loja.id}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Gerenciar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
              <Store className="h-10 w-10" />
              <p className="font-semibold text-foreground">Nenhuma loja cadastrada</p>
              <p className="text-sm">Cadastre uma nova unidade para distribuir o estoque.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Locais operacionais</CardTitle>
          <CardDescription>Areas tecnicas, patios ou almoxarifados registrados.</CardDescription>
        </CardHeader>
        <CardContent>
          {locaisQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : locaisQuery.data && locaisQuery.data.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {locaisQuery.data.map((local) => (
                <Card key={local.id} className="border border-border/80 shadow-sm">
                  <CardContent className="space-y-1 p-4">
                    <h3 className="text-base font-semibold">{local.nome}</h3>
                    <p className="text-xs text-muted-foreground">ID: {local.id}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
              <MapPin className="h-10 w-10" />
              <p className="font-semibold text-foreground">Nenhum local cadastrado</p>
              <p className="text-sm">Crie locais para organizar a distribuicao interna.</p>
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
