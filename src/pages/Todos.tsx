import { useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

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
import { useVersionStore } from "@/store/versionStore";
import type { Database, Enums } from "@/types";

type DocumentacaoRow = Database["public"]["Tables"]["documentacao_veiculos"]["Row"];
type DocumentacaoItem = Pick<
  DocumentacaoRow,
  | "id"
  | "status_geral"
  | "veiculo_id"
  | "tem_crlv"
  | "tem_crv"
  | "tem_multas"
  | "tem_dividas_ativas"
  | "data_conclusao"
  | "atualizado_em"
> & {
  veiculos: { placa: string } | null;
};

type StatusDocumentacao = Enums["status_documentacao"];

async function fetchDocumentacao(empresaId: string): Promise<DocumentacaoItem[]> {
  const { data, error } = await supabase
    .from("documentacao_veiculos")
    .select(
      "id, status_geral, veiculo_id, tem_crlv, tem_crv, tem_multas, tem_dividas_ativas, data_conclusao, atualizado_em, veiculos ( placa )"
    )
    .eq("empresa_id", empresaId)
    .order("atualizado_em", { ascending: false })
    .limit(20);

  if (error) throw error;

  const rows = (data ?? []) as Array<DocumentacaoRow & { veiculos: { placa: string } | null }>;

  return rows.map((row) => ({
    id: row.id,
    status_geral: row.status_geral as StatusDocumentacao,
    veiculo_id: row.veiculo_id,
    tem_crlv: row.tem_crlv,
    tem_crv: row.tem_crv,
    tem_multas: row.tem_multas,
    tem_dividas_ativas: row.tem_dividas_ativas,
    data_conclusao: row.data_conclusao,
    atualizado_em: row.atualizado_em,
    veiculos: row.veiculos ?? null,
  }));
}

export default function Todos() {
  const queryClient = useQueryClient();
  const empresaId = useAuthStore((state) => state.empresaId);
  const version = useVersionStore((state) => state.versions.todos);
  const updateVersion = useVersionStore((state) => state.updateVersion);

  useEffect(() => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === "documentacao" && query.queryKey[1] !== version,
    });
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] === "documentacao" && query.queryKey[1] !== version,
    });
  }, [version, queryClient]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["documentacao", version, empresaId],
    queryFn: () => fetchDocumentacao(empresaId!),
    enabled: Boolean(empresaId),
  });

  const resumo = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        pendentes: 0,
        concluidos: 0,
        alerta: 0,
      };
    }

    const pendentes = data.filter((item) => item.status_geral !== "concluida").length;
    const concluidos = data.filter((item) => item.status_geral === "concluida").length;
    const alerta = data.filter((item) => item.tem_dividas_ativas || item.tem_multas).length;

    return { pendentes, concluidos, alerta };
  }, [data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentacao</h1>
          <p className="text-muted-foreground">
            Acompanhe o status das etapas de documentacao dos veiculos.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar lista
          </Button>
          <Button variant="hero" onClick={() => updateVersion("todos")}>
            Incrementar versao ({version})
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ResumoCard
          icon={<AlertCircle className="h-6 w-6 text-warning" />}
          title="Pendencias"
          value={resumo.pendentes}
          helper="Processos aguardando conclusao"
        />
        <ResumoCard
          icon={<CheckCircle2 className="h-6 w-6 text-success" />}
          title="Concluidos"
          value={resumo.concluidos}
          helper="Documentos finalizados"
        />
        <ResumoCard
          icon={<AlertCircle className="h-6 w-6 text-destructive" />}
          title="Alertas"
          value={resumo.alerta}
          helper="Multas ou dividas pendentes"
        />
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ultimas atualizacoes</CardTitle>
            <CardDescription>
              {isFetching ? "Atualizando dados..." : `Dados sincronizados na versao ${version}.`}
            </CardDescription>
          </div>
          {isFetching && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="font-semibold">Nenhuma pendencia encontrada</p>
              <p className="text-sm text-muted-foreground">
                Todos os processos de documentacao estao em dia.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((item) => (
                <Card key={item.id} className="border border-border/80 shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {item.status_geral}
                      </p>
                      <h3 className="text-base font-bold">
                        Veiculo {item.veiculos?.placa ?? item.veiculo_id}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Atualizado em {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(
                          new Date(
                            item.atualizado_em ??
                              item.data_conclusao ??
                              new Date().toISOString()
                          )
                        )}
                      </p>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <Badge label="CRLV" active={Boolean(item.tem_crlv)} />
                      <Badge label="CRV" active={Boolean(item.tem_crv)} />
                      <Badge label="Multas" active={!item.tem_multas} invert />
                      <Badge label="Dividas" active={!item.tem_dividas_ativas} invert />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ResumoCardProps {
  icon: ReactNode;
  title: string;
  value: number;
  helper: string;
}

function ResumoCard({ icon, title, value, helper }: ResumoCardProps) {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="rounded-full bg-muted p-2">{icon}</div>
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <CardDescription>{helper}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface BadgeProps {
  label: string;
  active: boolean;
  invert?: boolean;
}

function Badge({ label, active, invert }: BadgeProps) {
  const baseColor = invert ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success";
  const mutedColor = "bg-muted text-muted-foreground";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active ? baseColor : mutedColor
      }`}
    >
      {label}
    </span>
  );
}
