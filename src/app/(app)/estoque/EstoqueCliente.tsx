"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useVeiculosUI, type VeiculoUI } from "@/adapters/adaptador-estoque";

const ESTADOS_VENDA: VeiculoUI["estado_venda"][] = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
];

const formatEstadoLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const matchesSearchTerm = (veiculo: VeiculoUI, normalizedTerm: string) => {
  if (!normalizedTerm) return true;
  const campos = [
    veiculo.veiculoDisplay,
    veiculo.modeloCompleto,
    veiculo.modeloDisplay,
    veiculo.modeloMarca,
    veiculo.placa,
    veiculo.localDisplay,
    veiculo.estadoVendaLabel,
    veiculo.estadoVeiculoLabel,
    veiculo.estagio_documentacao,
    veiculo.cor,
  ];

  return campos.some((campo) => normalizeText(campo).includes(normalizedTerm));
};

export default function EstoquePage() {
  const { data: veiculos = [], isLoading } = useVeiculosUI();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const estadoFiltroParam = searchParams.get("estado");
  const estadoFiltro = estadoFiltroParam && ESTADOS_VENDA.includes(estadoFiltroParam as VeiculoUI["estado_venda"])
    ? (estadoFiltroParam as VeiculoUI["estado_venda"])
    : null;

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [localFiltro, setLocalFiltro] = useState("");
  const [modeloFiltro, setModeloFiltro] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());

  const contagemPorEstado = useMemo(() => {
    const counts = ESTADOS_VENDA.reduce<Record<string, number>>((acc, estado) => {
      acc[estado] = 0;
      return acc;
    }, {});

    for (const veiculo of veiculos) {
      const estado = veiculo.estado_venda;
      if (estado && counts[estado] !== undefined) {
        counts[estado] += 1;
      }
    }

    return counts;
  }, [veiculos]);

  const uniqueLocais = useMemo(() => {
    const set = new Set<string>();
    veiculos.forEach((veiculo) => {
      const local = veiculo.localDisplay;
      if (local) set.add(local);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
  }, [veiculos]);

  const uniqueModelos = useMemo(() => {
    const set = new Set<string>();
    veiculos.forEach((veiculo) => {
      const modelo = veiculo.modeloCompleto;
      if (modelo) set.add(modelo);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
  }, [veiculos]);

  const filtrados = useMemo(() => {
    return veiculos.filter((veiculo) => {
      if (estadoFiltro && veiculo.estado_venda !== estadoFiltro) return false;
      if (localFiltro && veiculo.localDisplay !== localFiltro) return false;
      if (modeloFiltro && veiculo.modeloCompleto !== modeloFiltro) return false;
      return true;
    });
  }, [estadoFiltro, localFiltro, modeloFiltro, veiculos]);

  useEffect(() => {
    if (!highlightedId) return;
    const timeout = window.setTimeout(() => setHighlightedId(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [highlightedId]);

  useEffect(() => {
    setHighlightedId(null);
  }, [estadoFiltro, localFiltro, modeloFiltro, viewMode, searchTerm]);

  const totalVeiculos = veiculos.length;
  const totalFiltrados = filtrados.length;

  const handleSearchSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const normalizedTerm = normalizeText(searchTerm);

      if (!normalizedTerm) {
        searchInputRef.current?.focus();
        return;
      }

      const match = filtrados.find((veiculo) => matchesSearchTerm(veiculo, normalizedTerm));
      if (!match) return;

      const element = itemRefs.current.get(match.id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(match.id);
      }
    },
    [filtrados, searchTerm],
  );

  const handleViewToggle = useCallback(() => {
    setViewMode((prev) => (prev === "cards" ? "table" : "cards"));
  }, []);

  const registerItemRef = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (element) {
        itemRefs.current.set(id, element);
      } else {
        itemRefs.current.delete(id);
      }
    },
    [],
  );

  const renderCards = useCallback(() => (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtrados.map((veiculo) => {
        const precoFormatado = veiculo.precoFormatado;
        const hodometroFormatado = veiculo.hodometroFormatado ?? "—";
        const caracteristicasResumo = veiculo.caracteristicasPrincipais;
        const isHighlighted = highlightedId === veiculo.id;

        return (
          <li key={veiculo.id} ref={registerItemRef(veiculo.id)} className="h-full">
            <article
              className={`flex h-full flex-col justify-between rounded-lg border bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md ${
                isHighlighted ? "border-blue-500 ring-2 ring-blue-200" : "border-zinc-200"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-blue-600">
                    {veiculo.estadoVendaLabel}
                  </span>
                  {precoFormatado && (
                    <span className="text-sm font-semibold text-zinc-800">{precoFormatado}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-zinc-800">{veiculo.veiculoDisplay}</h2>
                  <p className="text-sm text-zinc-500">Placa {veiculo.placa}</p>
                </div>
                <dl className="mt-4 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                  <div className="flex flex-col">
                    <dt className="font-semibold text-zinc-700">Ano</dt>
                    <dd className="text-zinc-600">{veiculo.anoPrincipal ?? "—"}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="font-semibold text-zinc-700">Hodômetro</dt>
                    <dd className="text-zinc-600">{hodometroFormatado}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="font-semibold text-zinc-700">Estado do veículo</dt>
                    <dd className="text-zinc-600">{veiculo.estadoVeiculoLabel}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="font-semibold text-zinc-700">Localização</dt>
                    <dd className="text-zinc-600">{veiculo.localDisplay}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="font-semibold text-zinc-700">Documentação</dt>
                    <dd className="text-zinc-600">{veiculo.estagio_documentacao ?? "Sem informação"}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="font-semibold text-zinc-700">Cor</dt>
                    <dd className="text-zinc-600">{veiculo.cor}</dd>
                  </div>
                </dl>
                {caracteristicasResumo.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {caracteristicasResumo.map((nome) => (
                      <span key={nome} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                        {nome}
                      </span>
                    ))}
                    {veiculo.caracteristicasExtrasTotal > 0 && (
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500">
                        +{veiculo.caracteristicasExtrasTotal} mais
                      </span>
                    )}
                  </div>
                )}
              </div>
              <footer className="mt-6 flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/estoque/${veiculo.id}`}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-zinc-200 px-3 py-2 font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                >
                  Ver detalhes
                </Link>
                <Link
                  href={`/editar/${veiculo.id}`}
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                  Editar
                </Link>
              </footer>
            </article>
          </li>
        );
      })}
    </ul>
  ), [filtrados, highlightedId, registerItemRef]);

  const renderTabela = useCallback(() => (
    <div className="rounded-lg border border-zinc-200">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] divide-y divide-zinc-200">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Ano</th>
              <th className="px-4 py-3">Hodômetro</th>
              <th className="px-4 py-3">Estado venda</th>
              <th className="px-4 py-3">Estado veículo</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Documentação</th>
              <th className="px-4 py-3">Cor</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white text-sm text-zinc-600">
            {filtrados.map((veiculo) => {
              const isHighlighted = highlightedId === veiculo.id;
              const baseRowClass = "transition hover:bg-blue-50/40";
              const highlightClass = isHighlighted ? "bg-blue-50/70 ring-1 ring-inset ring-blue-300" : "";

              return (
                <tr
                  key={veiculo.id}
                  ref={registerItemRef(veiculo.id)}
                  className={`${baseRowClass} ${highlightClass}`.trim()}
                >
                  <td className="max-w-xs px-4 py-3 font-medium text-zinc-800">{veiculo.veiculoDisplay}</td>
                  <td className="px-4 py-3">{veiculo.placa}</td>
                  <td className="px-4 py-3">{veiculo.anoPrincipal ?? "—"}</td>
                  <td className="px-4 py-3">{veiculo.hodometroFormatado ?? "—"}</td>
                  <td className="px-4 py-3">{veiculo.estadoVendaLabel}</td>
                  <td className="px-4 py-3">{veiculo.estadoVeiculoLabel}</td>
                  <td className="px-4 py-3">{veiculo.localDisplay}</td>
                  <td className="px-4 py-3">{veiculo.precoFormatado ?? "—"}</td>
                  <td className="px-4 py-3">{veiculo.estagio_documentacao ?? "Sem informação"}</td>
                  <td className="px-4 py-3">{veiculo.cor ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/estoque/${veiculo.id}`}
                        className="inline-flex items-center rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/editar/${veiculo.id}`}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  ), [filtrados, highlightedId, registerItemRef]);

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <header className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Estoque de Veículos</h1>
            <p className="text-sm text-zinc-500">
              Visualize, edite e cadastre veículos disponíveis nas lojas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 sm:inline-flex">
              {totalFiltrados} de {totalVeiculos} veículos
            </span>
            <Link
              href="/criar"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Cadastrar veículo
            </Link>
          </div>
        </div>

        <nav className="mt-6 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={pathname ?? "/estoque"}
            className={`rounded-full border px-3 py-1.5 transition ${
              !estadoFiltro
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800"
            }`}
          >
            Todos
            <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs text-zinc-500">
              {veiculos.length}
            </span>
          </Link>
          {ESTADOS_VENDA.map((estado) => {
            const active = estadoFiltro === estado;
            const href = `${pathname}?estado=${estado}`;
            return (
              <Link
                key={estado}
                href={href}
                className={`rounded-full border px-3 py-1.5 transition ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800"
                }`}
              >
                {formatEstadoLabel(estado)}
                <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs text-zinc-500">
                  {contagemPorEstado[estado] ?? 0}
                </span>
              </Link>
            );
          })}
        </nav>
      </header>

      <section className="mx-auto mt-6 w-full max-w-5xl rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
        >
          <label className="flex w-full items-center gap-3 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 sm:max-w-xl">
            <span className="text-xs font-semibold uppercase text-zinc-400">Pesquisar</span>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Modelo, placa, local..."
              className="h-10 w-full border-none bg-transparent text-sm text-zinc-700 outline-none"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
            aria-label="Buscar veículo"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 13.5L17 17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle
                cx="9"
                cy="9"
                r="5.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            <span>Buscar</span>
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-1 flex-wrap gap-2">
            <select
              value={localFiltro}
              onChange={(event) => setLocalFiltro(event.target.value)}
              className="h-10 flex-1 rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:flex-initial sm:min-w-[200px]"
            >
              <option value="">Todos os locais</option>
              {uniqueLocais.map((local) => (
                <option key={local} value={local}>
                  {local}
                </option>
              ))}
            </select>
            <select
              value={modeloFiltro}
              onChange={(event) => setModeloFiltro(event.target.value)}
              className="h-10 flex-1 rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:flex-initial sm:min-w-[200px]"
            >
              <option value="">Todos os modelos</option>
              {uniqueModelos.map((modelo) => (
                <option key={modelo} value={modelo}>
                  {modelo}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleViewToggle}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
          >
            {viewMode === "cards" ? "Ver em tabela" : "Ver em cartões"}
          </button>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Exibindo {totalFiltrados} de {totalVeiculos} veículos cadastrados.
        </p>
      </section>

      <main className="mx-auto mt-6 w-full max-w-5xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
            <p className="text-base font-medium text-zinc-600">Carregando veículos do estoque...</p>
          </div>
        ) : totalFiltrados === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
            <p className="text-base font-medium text-zinc-600">Nenhum veículo encontrado com os filtros aplicados.</p>
            <p className="mt-2 text-sm text-zinc-500">Ajuste a busca ou cadastre novos veículos para vê-los aqui.</p>
          </div>
        ) : viewMode === "table" ? (
          renderTabela()
        ) : (
          renderCards()
        )}
      </main>
    </div>
  );
}
