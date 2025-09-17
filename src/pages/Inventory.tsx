import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Filter,
  MapPin,
  Gauge,
  Search,
  Plus,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVehicles, useCreateVehicle, useDeleteVehicle } from "@/hooks/useVehicles";
import { useLocais, useModelos } from "@/hooks/useCompanyConfigurations";
import type { VehicleInsertInput } from "@/services/veiculos";

const ESTADO_VENDA_OPTIONS = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
] as const;

const ESTADO_VEICULO_OPTIONS = [
  "novo",
  "seminovo",
  "usado",
  "sucata",
  "limpo",
  "sujo",
] as const;

type VehicleFilters = {
  search: string;
  estadoVenda: string;
  estadoVeiculo: string;
  localId: string;
  modeloId: string;
};

const DEFAULT_FILTERS: VehicleFilters = {
  search: "",
  estadoVenda: "",
  estadoVeiculo: "",
  localId: "",
  modeloId: "",
};

export function Inventory() {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: vehicles, isLoading, isFetching } = useVehicles();
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const { data: locais } = useLocais();
  const { data: modelos } = useModelos();

  useEffect(() => {
    const state = (location.state as { openCreate?: boolean } | null) ?? null;
    if (state?.openCreate) {
      setShowCreateForm(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  async function handleDeleteVehicle(id: string) {
    const confirmed = window.confirm("Deseja remover este veiculo do estoque?");
    if (!confirmed) return;
    try {
      await deleteVehicle.mutateAsync({ veiculoId: id });
      setFeedback("Veiculo removido com sucesso.");
      setErrorMessage(null);
    } catch (erro) {
      const message = erro instanceof Error ? erro.message : "Nao foi possivel remover o veiculo.";
      setErrorMessage(message);
    }
  }

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = window.setTimeout(() => setErrorMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];

    return vehicles.filter((vehicle) => {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = searchTerm
        ? [
            vehicle.placa,
            vehicle.observacao,
            vehicle.cor,
            vehicle.estado_venda,
          ]
            .filter(Boolean)
            .some((value) => (value ?? "").toLowerCase().includes(searchTerm))
        : true;

      const matchesEstadoVenda = filters.estadoVenda
        ? vehicle.estado_venda === filters.estadoVenda
        : true;

      const matchesEstadoVeiculo = filters.estadoVeiculo
        ? vehicle.estado_veiculo === filters.estadoVeiculo
        : true;

      const matchesLocal = filters.localId
        ? vehicle.local_id === filters.localId
        : true;

      const matchesModelo = filters.modeloId
        ? vehicle.modelo_id === filters.modeloId
        : true;

      return (
        matchesSearch &&
        matchesEstadoVenda &&
        matchesEstadoVeiculo &&
        matchesLocal &&
        matchesModelo
      );
    });
  }, [filters, vehicles]);

  const metrics = useMemo(() => {
    if (!vehicles || vehicles.length === 0) {
      return {
        total: 0,
        vendidos: 0,
        disponiveis: 0,
        ticketMedio: 0,
      };
    }

    const total = vehicles.length;
    const vendidos = vehicles.filter((v) => v.estado_venda === "vendido").length;
    const disponiveis = vehicles.filter((v) => v.estado_venda === "disponivel").length;
    const ticketMedio =
      vehicles.reduce((acc, item) => acc + (item.preco_venal ?? 0), 0) /
      total;

    return { total, vendidos, disponiveis, ticketMedio };
  }, [vehicles]);

  function handleFilterChange<K extends keyof VehicleFilters>(
    key: K,
    value: VehicleFilters[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleResetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  async function handleCreateVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const dados: VehicleInsertInput = {
      placa: String(formData.get("placa") ?? "").trim().toUpperCase(),
      cor: String(formData.get("cor") ?? "").trim(),
      estado_venda: formData.get("estado_venda") as VehicleInsertInput["estado_venda"],
      hodometro: Number(formData.get("hodometro") ?? 0),
      estado_veiculo: (formData.get("estado_veiculo") || null) as VehicleInsertInput["estado_veiculo"],
      modelo_id: (formData.get("modelo_id") || null) as VehicleInsertInput["modelo_id"],
      local_id: (formData.get("local_id") || null) as VehicleInsertInput["local_id"],
      preco_venal: formData.get("preco_venal")
        ? Number(formData.get("preco_venal"))
        : null,
      observacao: (formData.get("observacao") || null) as VehicleInsertInput["observacao"],
    };

    try {
      await createVehicle.mutateAsync({ dados });
      event.currentTarget.reset();
      setShowCreateForm(false);
    } catch (erro) {
      console.error("Falha ao cadastrar veiculo", erro);
    }
  }

  const busy = isLoading || isFetching;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestao de estoque</h1>
          <p className="text-muted-foreground">
            Monitore e organize todos os veiculos cadastrados na empresa.
          </p>
        </div>
        <Button variant="hero" size="lg" onClick={() => setShowCreateForm((state) => !state)}>
          <Plus className="mr-2 h-4 w-4" />
          {showCreateForm ? "Fechar formulario" : "Novo veiculo"}
        </Button>
      </div>

      {feedback && (
        <div className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {feedback}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total" value={metrics.total} helper="Veiculos cadastrados" />
        <MetricCard title="Disponiveis" value={metrics.disponiveis} helper="Prontos para venda" />
        <MetricCard title="Vendidos" value={metrics.vendidos} helper="Negocios concluidos" />
        <MetricCard
          title="Ticket medio"
          value={metrics.ticketMedio}
          helper="Valor medio de venda"
          isCurrency
        />
      </div>

      <Card className="shadow-card">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Filtros avancados
          </CardTitle>
          <CardDescription>
            Combine filtros para localizar veiculos de forma precisa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Busca rapida
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={filters.search}
                  onChange={(event) => handleFilterChange("search", event.target.value)}
                  placeholder="Placa, cor ou observacao"
                  className="h-10 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Estado de venda
              </label>
              <select
                value={filters.estadoVenda}
                onChange={(event) => handleFilterChange("estadoVenda", event.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                {ESTADO_VENDA_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Estado do veiculo
              </label>
              <select
                value={filters.estadoVeiculo}
                onChange={(event) => handleFilterChange("estadoVeiculo", event.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                {ESTADO_VEICULO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Local</label>
              <select
                value={filters.localId}
                onChange={(event) => handleFilterChange("localId", event.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                {locais?.map((local) => (
                  <option key={local.id} value={local.id}>
                    {local.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Modelo</label>
              <select
                value={filters.modeloId}
                onChange={(event) => handleFilterChange("modeloId", event.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                {modelos?.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {(modelo.marca ?? "Marca") + " " + modelo.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={handleResetFilters}>
              Limpar filtros
            </Button>
            {busy && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando dados
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Novo veiculo</CardTitle>
            <CardDescription>
              Informe os dados para cadastrar o veiculo na empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateVehicle}>
              <Field label="Placa">
                <input
                  name="placa"
                  required
                  placeholder="ABC1D23"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm uppercase"
                />
              </Field>

              <Field label="Cor">
                <input
                  name="cor"
                  required
                  placeholder="Prata"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </Field>

              <Field label="Estado de venda">
                <select
                  name="estado_venda"
                  required
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                >
                  {ESTADO_VENDA_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Estado do veiculo">
                <select
                  name="estado_veiculo"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                >
                  <option value="">Selecionar</option>
                  {ESTADO_VEICULO_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Hodometro (km)">
                <input
                  name="hodometro"
                  type="number"
                  min={0}
                  required
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </Field>

              <Field label="Preco venal">
                <input
                  name="preco_venal"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                />
              </Field>

              <Field label="Local">
                <select
                  name="local_id"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                >
                  <option value="">Selecionar</option>
                  {locais?.map((local) => (
                    <option key={local.id} value={local.id}>
                      {local.nome}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Modelo">
                <select
                  name="modelo_id"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                >
                  <option value="">Selecionar</option>
                  {modelos?.map((modelo) => (
                    <option key={modelo.id} value={modelo.id}>
                      {(modelo.marca ?? "Marca") + " " + modelo.nome}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Observacao" className="md:col-span-2">
                <textarea
                  name="observacao"
                  rows={3}
                  placeholder="Informacoes adicionais"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </Field>

              <div className="md:col-span-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createVehicle.isPending}>
                  {createVehicle.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Salvando
                    </span>
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Veiculos filtrados</CardTitle>
            <CardDescription>
              {filteredVehicles.length} resultado(s) com os filtros aplicados.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {locais?.length ?? 0} locais cadastrados
          </div>
        </CardHeader>
        <CardContent>
          {busy ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-center">
              <Gauge className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Nenhum veiculo encontrado</p>
              <p className="text-sm text-muted-foreground">
                Ajuste os filtros ou cadastre um novo veiculo.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredVehicles.map((vehicle) => {
                const localNome = locais?.find((item) => item.id === vehicle.local_id)?.nome;
                const modeloInfo = modelos?.find((item) => item.id === vehicle.modelo_id);

                return (
                  <article
                    key={vehicle.id}
                    className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-dropdown"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {vehicle.estado_venda}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("pt-BR", {
                            dateStyle: "short",
                          }).format(new Date(vehicle.registrado_em))}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-wide">
                        {vehicle.placa}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {(modeloInfo?.marca ?? "Modelo") + " " + (modeloInfo?.nome ?? "Nao informado")}
                      </p>
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Cor</dt>
                          <dd className="font-semibold">{vehicle.cor}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Hodometro</dt>
                          <dd className="font-semibold">{vehicle.hodometro.toLocaleString("pt-BR")}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Local</dt>
                          <dd className="font-semibold">{localNome ?? "Nao informado"}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Preco</dt>
                          <dd className="font-semibold">
                            {vehicle.preco_venal
                              ? vehicle.preco_venal.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })
                              : "Nao informado"}
                          </dd>
                        </div>
                      </dl>
                      {vehicle.observacao && (
                        <p className="rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                          {vehicle.observacao}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/app/veiculos/${vehicle.id}`)}
                      >
                        Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleteVehicle.isPending}
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        {deleteVehicle.isPending ? "Removendo..." : "Remover"}
                      </Button>
                    </div>
                  </article>
                );
              })}
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
  isCurrency?: boolean;
}

function MetricCard({ title, value, helper, isCurrency }: MetricCardProps) {
  const formattedValue = isCurrency
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : value.toLocaleString("pt-BR");

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

function Field({ label, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export default Inventory;
