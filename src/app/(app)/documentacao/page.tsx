"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import {
  useDocumentacaoVeiculos,
  useDocumentosPastas,
  type DocumentosPastasResumo,
} from "@/adapters/adaptador-documentacao";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Permission } from "@/types/rbac";
import { PermissionGuard } from "@/components/PermissionGuard";

const TABS = [
  { key: "tabela", label: "Registros" },
  { key: "pastas", label: "Repositório" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type PastaDetalhada = DocumentosPastasResumo & {
  title: string;
  placa: string;
  lojaNome: string;
  statusLabel: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const formatStatusLabel = (value?: string | null) =>
  value
    ? value
        .split("_")
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
        .join(" ")
    : "Sem status";

const formatDate = (value?: string | null, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  const formatter =
    options != null ? new Intl.DateTimeFormat("pt-BR", options) : dateTimeFormatter;
  return formatter.format(parsed);
};

const formatDocumentCount = (count: number) =>
  count === 1 ? "1 documento" : `${count} documentos`;

const TABLE_DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: "short" };

export default function DocumentacaoListaPage() {
  const { data: empresa } = useEmpresaDoUsuario();
  const empresaId = empresa?.empresa_id;
  const { data = [], isLoading } = useDocumentacaoVeiculos(empresaId);
  const { data: pastas = [], isLoading: isPastasLoading } = useDocumentosPastas(empresaId);
  const router = useRouter();
  const [placaBusca, setPlacaBusca] = useState("");
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("tabela");

  const normalizar = (valor: string) =>
    valor
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  const handleBuscarPlaca = () => {
    if (!placaBusca.trim()) {
      setErroBusca("Informe uma placa");
      return;
    }
    const alvo = normalizar(placaBusca);
    const encontrado = data.find((registro) => {
      const placa = registro.veiculo?.placa ? normalizar(registro.veiculo.placa) : "";
      return placa === alvo;
    });
    if (encontrado?.veiculo_id) {
      setErroBusca(null);
      router.push(`/documentacao/${encontrado.veiculo_id}`);
      return;
    }
    setErroBusca("Nenhum veículo com essa placa foi encontrado.");
  };

  const registrosOrdenados = useMemo(() => {
    return [...data].sort((a, b) => {
      const dataA = a.criado_em ? new Date(a.criado_em).getTime() : 0;
      const dataB = b.criado_em ? new Date(b.criado_em).getTime() : 0;
      return dataB - dataA;
    });
  }, [data]);

  const documentacaoPorVeiculo = useMemo(() => {
    const map = new Map<string, (typeof data)[number]>();
    for (const registro of data) {
      map.set(registro.veiculo_id, registro);
    }
    return map;
  }, [data]);

  const pastasDetalhadas = useMemo<PastaDetalhada[]>(() => {
    if (!pastas.length) return [];
    return pastas.map((item) => {
      const registro = documentacaoPorVeiculo.get(item.veiculoId) ?? null;
      const veiculo = registro?.veiculo ?? null;
      const placaBruta = (veiculo?.placa ?? "").toUpperCase();
      const placa = placaBruta || "Sem placa";
      const title =
        veiculo?.veiculo_display ??
        veiculo?.modelo?.nome ??
        (placaBruta ? `Veículo ${placa}` : "Veículo sem placa definida");
      const lojaNome = registro?.loja?.nome ?? "Sem loja definida";
      const statusLabel = formatStatusLabel(registro?.status_geral);
      return {
        ...item,
        title,
        placa,
        lojaNome,
        statusLabel,
      };
    });
  }, [documentacaoPorVeiculo, pastas]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Documentações</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Registros de documentação por veículo
            </p>
          </div>
        </header>

        <PermissionGuard permission={Permission.DOCUMENTACAO_VISUALIZAR}>
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <Button
                key={tab.key}
                type="button"
                variant={activeTab === tab.key ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className={
                  activeTab === tab.key
                    ? "bg-[var(--purple-magic)] text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {activeTab === "tabela" ? (
            <Card className="mt-4">
              <Card.Header>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Tabela documentacao_veiculos</h2>
                      <p className="text-sm text-gray-500">
                        Gerencie o progresso de documentação por veículo
                      </p>
                    </div>
                    <Badge variant="info" size="sm">
                      {data.length} registro(s)
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <Input
                        value={placaBusca}
                        onChange={(e) => setPlacaBusca(e.target.value)}
                        placeholder="Buscar documentação pela placa"
                        leftIcon={<Search className="w-4 h-4" />}
                      />
                    </div>
                    <Button variant="outline" onClick={handleBuscarPlaca}>
                      Ir para documentação
                    </Button>
                  </div>
                  {erroBusca && <p className="text-sm text-red-600">{erroBusca}</p>}
                </div>
              </Card.Header>
              <Card.Body>
                {isLoading ? (
                  <div className="text-sm text-gray-500">Carregando…</div>
                ) : data.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Nenhum registro encontrado. Assim que um veículo tiver sua documentação
                    iniciada, ele aparecerá por aqui.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="text-left text-gray-500">
                        <tr>
                          <th className="py-2 pr-4">Placa</th>
                          <th className="py-2 pr-4">Modelo</th>
                          <th className="py-2 pr-4">Loja</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Entrada</th>
                          <th className="py-2 pr-4">Transferência</th>
                          <th className="py-2 pr-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrosOrdenados.map((row) => (
                          <tr key={row.id} className="border-t">
                            <td className="py-3 pr-4 font-mono uppercase">
                              {row.veiculo?.placa ?? "—"}
                            </td>
                            <td className="py-3 pr-4">
                              {row.veiculo?.modelo?.nome ?? "Modelo não informado"}
                            </td>
                            <td className="py-3 pr-4">{row.loja?.nome ?? "—"}</td>
                            <td className="py-3 pr-4">
                              <Badge
                                variant="default"
                                className="capitalize bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                              >
                                {formatStatusLabel(row.status_geral)}
                              </Badge>
                            </td>
                            <td className="py-2 pr-4">
                              {formatDate(row.data_entrada, TABLE_DATE_FORMAT)}
                            </td>
                            <td className="py-2 pr-4">
                              {formatDate(row.data_transferencia, TABLE_DATE_FORMAT)}
                            </td>
                            <td className="py-2 pr-4">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/documentacao/${row.veiculo_id}`}>
                                  Ver documentos
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Card className="mt-4">
              <Card.Header>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Pastas com documentos</h2>
                    <p className="text-sm text-gray-500">
                      Visualize rapidamente os veículos que possuem documentos anexados.
                    </p>
                  </div>
                  <Badge variant="info" size="sm">
                    {pastasDetalhadas.length} pasta(s)
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {isPastasLoading ? (
                  <div className="text-sm text-gray-500">Carregando pastas…</div>
                ) : pastasDetalhadas.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Ainda não há documentos enviados. Assim que um documento for registrado, a
                    pasta do veículo aparecerá aqui.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pastasDetalhadas.map((pasta) => (
                      <Link
                        key={pasta.veiculoId}
                        href={`/documentacao/${pasta.veiculoId}`}
                        className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-magic)] focus-visible:ring-offset-2"
                      >
                        <Card className="h-full border border-gray-200 transition hover:-translate-y-0.5 hover:border-[var(--purple-magic)] hover:shadow-lg dark:border-gray-700 dark:hover:border-[var(--purple-light)]">
                          <Card.Body className="flex h-full flex-col gap-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-gray-900 transition group-hover:text-[var(--purple-darker)] dark:text-gray-100 dark:group-hover:text-[var(--purple-light)]">
                                  {pasta.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Placa{" "}
                                  <span className="font-mono uppercase text-gray-900 dark:text-gray-100">
                                    {pasta.placa}
                                  </span>
                                </p>
                              </div>
                              <Badge variant="info" size="sm">
                                {formatDocumentCount(pasta.totalDocumentos)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="default"
                                size="sm"
                                className="capitalize bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                              >
                                {pasta.statusLabel}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Atualizado {formatDate(pasta.ultimaAtualizacao)}
                              </span>
                            </div>
                            <dl className="grid gap-3 text-sm text-gray-600 dark:text-gray-300">
                              <div>
                                <dt className="text-xs uppercase text-gray-500 dark:text-gray-400">
                                  Loja responsável
                                </dt>
                                <dd className="font-medium text-gray-900 dark:text-gray-100">
                                  {pasta.lojaNome}
                                </dd>
                              </div>
                              {pasta.primeiraCriacao && (
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <span>Primeiro documento</span>
                                  <span>{formatDate(pasta.primeiraCriacao)}</span>
                                </div>
                              )}
                            </dl>
                            <div className="mt-auto flex items-center justify-end text-xs font-medium text-[var(--purple-magic)] group-hover:underline">
                              Abrir linha do tempo →
                            </div>
                          </Card.Body>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </PermissionGuard>
      </div>
    </div>
  );
}
