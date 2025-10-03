"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { LojaSelector } from "@/components/LojaSelector";
import { useLojaStore } from "@/stores/useLojaStore";
import {
  useVeiculosLojaUI,
  type VeiculoLojaUI,
} from "@/adapters/adaptador-vitrine";
import { useVeiculosUI, type VeiculoUI } from "@/adapters/adaptador-estoque";
import { AddVehicleToStoreButton } from "./loja-actions";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { useCaracteristicas } from "@/hooks/use-configuracoes";

type ViewMode = "cards-photo" | "cards-info" | "table";

const VIEW_MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "cards-photo", label: "Cards com foto" },
  { value: "cards-info", label: "Cards informativos" },
  { value: "table", label: "Tabela" },
];

const ESTADOS_VENDA = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
] as const;

type EstadoVendaFiltro = (typeof ESTADOS_VENDA)[number];

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getDisplayPrice = (veiculo: VeiculoLojaUI) =>
  veiculo.precoLojaFormatado ?? veiculo.veiculo?.precoFormatado ?? "—";

const renderEstadoBadge = (veiculo: VeiculoLojaUI) => {
  const label = veiculo.veiculo?.estadoVendaLabel ?? "Sem status";
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-blue-600">
      {label}
    </span>
  );
};

const renderGridCards = (veiculos: VeiculoLojaUI[]) => (
  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {veiculos.map((item) => (
      <li key={item.id}>
        <article className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
          <Link href={`/vitrine/${item.id}`}>
            <div className="relative flex aspect-video items-center justify-center bg-zinc-100">
              {item.capaUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.capaUrl}
                    alt={item.veiculo?.veiculoDisplay ?? "Veículo sem foto"}
                    className="h-full w-full object-cover"
                  />
                </>
              ) : (
                <span className="text-xs font-medium text-zinc-500">Sem foto de capa</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-3">
                {renderEstadoBadge(item)}
                <span className="text-sm font-semibold text-zinc-800">
                  {getDisplayPrice(item)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-medium text-zinc-800">
                  {item.veiculo?.veiculoDisplay ?? "Veículo sem modelo"}
                </h2>
                <p className="text-sm text-zinc-500">Placa {item.veiculo?.placa ?? "—"}</p>
              </div>
              <dl className="grid gap-3 text-xs text-zinc-500 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-zinc-700">Local</dt>
                  <dd>{item.veiculo?.localDisplay ?? "Sem local"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-700">Ano</dt>
                  <dd>{item.veiculo?.anoPrincipal ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-700">Disponível desde</dt>
                  <dd>{item.dataEntradaFormatada ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-700">Hodômetro</dt>
                  <dd>{item.veiculo?.hodometroFormatado ?? "—"}</dd>
                </div>
              </dl>
            </div>
          </Link>
        </article>
      </li>
    ))}
  </ul>
);

const renderInfoCards = (veiculos: VeiculoLojaUI[]) => (
  <ul className="flex flex-col gap-4">
    {veiculos.map((item) => (
      <li key={item.id}>
        <article className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md md:flex-row md:items-center md:justify-between">
          <Link href={`/vitrine/${item.id}`}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-medium text-zinc-800">
                  {item.veiculo?.veiculoDisplay ?? "Veículo sem modelo"}
                </h2>
                {renderEstadoBadge(item)}
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
                <span>
                  <span className="font-medium text-zinc-700">Placa:</span> {item.veiculo?.placa ?? "—"}
                </span>
                <span>
                  <span className="font-medium text-zinc-700">Local:</span> {item.veiculo?.localDisplay ?? "Sem local"}
                </span>
                <span>
                  <span className="font-medium text-zinc-700">Ano:</span> {item.veiculo?.anoPrincipal ?? "—"}
                </span>
                <span>
                  <span className="font-medium text-zinc-700">Entrada:</span> {item.dataEntradaFormatada ?? "—"}
                </span>
                <span>
                  <span className="font-medium text-zinc-700">Preço:</span> {getDisplayPrice(item)}
                </span>
              </div>
              {item.veiculo?.caracteristicasPrincipais?.length ? (
                <div className="flex flex-wrap gap-2">
                  {item.veiculo.caracteristicasPrincipais.map((caracteristica: string) => (
                    <span
                      key={caracteristica}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600"
                    >
                      {caracteristica}
                    </span>
                  ))}
                  {item.veiculo.caracteristicasExtrasTotal > 0 && (
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500">
                      +{item.veiculo.caracteristicasExtrasTotal} mais
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </Link>
        </article>
      </li>
    ))}
  </ul>
);

const renderTabela = (veiculos: VeiculoLojaUI[]) => (
  <div className="overflow-hidden rounded-lg border border-zinc-200">
    <table className="min-w-full divide-y divide-zinc-200">
      <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
        <tr>
          <th className="px-4 py-3">Veículo</th>
          <th className="px-4 py-3">Placa</th>
          <th className="px-4 py-3">Preço</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Local</th>
          <th className="px-4 py-3">Fotos</th>
          <th className="px-4 py-3 text-right">Ações</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 bg-white text-sm text-zinc-600">
        {veiculos.map((item) => (
          <tr key={item.id} className="transition hover:bg-blue-50/30">
            <Link href={`/vitrine/${item.id}`}>
              <td className="px-4 py-3 font-medium text-zinc-800">
                {item.veiculo?.veiculoDisplay ?? "Veículo"}
              </td>
              <td className="px-4 py-3">{item.veiculo?.placa ?? "—"}</td>
              <td className="px-4 py-3">{getDisplayPrice(item)}</td>
              <td className="px-4 py-3">{item.veiculo?.estadoVendaLabel ?? "Sem status"}</td>
              <td className="px-4 py-3">{item.veiculo?.localDisplay ?? "Sem local"}</td>
              <td className="px-4 py-3">{item.temFotos ? "Sim" : "Não"}</td>
              <td className="px-4 py-3 text-right">
              </td>
            </Link>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function VitrinePage() {
  const lojaSelecionada = useLojaStore((state) => state.lojaSelecionada);
  const lojaId = lojaSelecionada?.id;

  const { data: empresa } = useEmpresaDoUsuario();
  const { data: caracteristicas = [] } = useCaracteristicas();

  const [viewMode, setViewMode] = useState<ViewMode>("cards-photo");
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoVendaFiltro | "">("");
  const [caracteristicaFiltro, setCaracteristicaFiltro] = useState<string>("");
  const [precoMin, setPrecoMin] = useState<string>("");
  const [precoMax, setPrecoMax] = useState<string>("");
  const [isManaging, setIsManaging] = useState(false);

  const { data: veiculosLoja = [], isLoading } = useVeiculosLojaUI(lojaId);
  const {
    data: veiculosEstoque = [],
    isLoading: isEstoqueLoading,
  } = useVeiculosUI();

  const filtrados = useMemo(() => {
    const texto = normalizeText(searchTerm);
    const parsedMin = Number(precoMin);
    const parsedMax = Number(precoMax);
    const min = precoMin.trim() !== "" && !Number.isNaN(parsedMin) ? parsedMin : null;
    const max = precoMax.trim() !== "" && !Number.isNaN(parsedMax) ? parsedMax : null;

    return veiculosLoja.filter((item) => {
      const veiculo = item.veiculo;
      if (!veiculo) return false;

      const atendeEstado = estadoFiltro ? veiculo.estado_venda === estadoFiltro : true;

      if (!atendeEstado) return false;

      const atendeCaracteristica = caracteristicaFiltro
        ? (veiculo.caracteristicas ?? []).some((caracteristica: { id: string }) => caracteristica?.id === caracteristicaFiltro)
        : true;

      if (!atendeCaracteristica) return false;

      const precoReferencia =
        typeof item.precoLoja === "number" ? item.precoLoja : veiculo.preco_venal ?? null;

      if (min !== null && (precoReferencia === null || precoReferencia < min)) return false;
      if (max !== null && (precoReferencia === null || precoReferencia > max)) return false;

      if (!texto) return true;

      const campos = [
        veiculo.veiculoDisplay,
        veiculo.modeloDisplay,
        veiculo.modeloMarca,
        veiculo.placa,
        veiculo.localDisplay,
      ];

      return campos.some((campo) => normalizeText(campo).includes(texto));
    });
  }, [veiculosLoja, searchTerm, estadoFiltro, caracteristicaFiltro, precoMin, precoMax]);

  const total = filtrados.length;

  const veiculosDisponiveis = useMemo(() => {
    if (!lojaSelecionada?.empresa_id) return [] as VeiculoUI[];
    const idsNaLoja = new Set(veiculosLoja.map((item) => item.veiculoId));
    return (veiculosEstoque as VeiculoUI[]).filter((veiculo) => {
      if (!veiculo?.id) return false;
      if (veiculo.empresa_id !== lojaSelecionada.empresa_id) return false;
      return !idsNaLoja.has(veiculo.id);
    });
  }, [veiculosEstoque, veiculosLoja, lojaSelecionada?.empresa_id]);

  const handleToggleManage = () => {
    setIsManaging((prev) => !prev);
  };

  const renderConteudo = () => {
    if (!lojaId) {
      return (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center text-sm text-zinc-500">
          Seleciona uma loja para visualizar a vitrine de veículos.
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center text-sm text-zinc-500">
          Carregando veículos desta loja…
        </div>
      );
    }

    if (filtrados.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center text-sm text-zinc-500">
          Nenhum veículo encontrado com os filtros aplicados.
        </div>
      );
    }

    if (viewMode === "table") return renderTabela(filtrados);
    if (viewMode === "cards-info") return renderInfoCards(filtrados);
    return renderGridCards(filtrados);
  };

  return (
    <div className="bg-white px-6 py-10 text-zinc-900">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Vitrine de veículos</h1>
            <p className="text-sm text-zinc-500">
              Explore e compartilhe os veículos disponíveis na loja selecionada.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <LojaSelector />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:items-start">
          <div className="flex w-full flex-col gap-2 sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="flex w-full min-w-[220px] flex-1 items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="hidden sm:inline">Pesquisar:</span>
              <input
                type="search"
                placeholder="Busque por modelo, placa ou local"
                className="h-8 flex-1 border-none bg-transparent text-sm text-zinc-700 outline-none"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <select
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value as EstadoVendaFiltro | "")}
              className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-48"
            >
              <option value="">Todos os status</option>
              {ESTADOS_VENDA.map((estado) => (
                <option key={estado} value={estado}>
                  {estado
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </option>
              ))}
            </select>
            <select
              value={caracteristicaFiltro}
              onChange={(event) => setCaracteristicaFiltro(event.target.value)}
              className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-56"
            >
              <option value="">Todas as características</option>
              {caracteristicas.map((caracteristica) => (
                <option key={caracteristica.id} value={caracteristica.id}>
                  {caracteristica.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Preço mínimo"
                value={precoMin}
                onChange={(event) => setPrecoMin(event.target.value)}
                className="h-10 min-w-[140px] flex-1 rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:flex-none sm:w-32"
              />
              <span className="text-xs text-zinc-400">até</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Preço máximo"
                value={precoMax}
                onChange={(event) => setPrecoMax(event.target.value)}
                className="h-10 min-w-[140px] flex-1 rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:flex-none sm:w-32"
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {(empresa?.papel === "proprietario") && (
                <button
                  type="button"
                  onClick={handleToggleManage}
                  disabled={!lojaSelecionada}
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition ${isManaging
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isManaging ? "Fechar gestão" : "Gerenciar vitrine"}
                </button>
              )}
              <div className="flex flex-wrap gap-2">
                {VIEW_MODE_OPTIONS.map((option) => {
                  const active = viewMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setViewMode(option.value)}
                      className={`rounded-md px-3 py-2 text-xs font-medium transition ${active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                        }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {lojaSelecionada ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span>
              Loja selecionada: <strong className="text-zinc-800">{lojaSelecionada.nome}</strong>
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {total} veículos encontrados
            </span>
          </div>
        ) : null}
      </header>

      <main className="mx-auto mt-8 w-full max-w-6xl">
        {renderConteudo()}
        {isManaging && (
          <section className="mt-10 space-y-4 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-800">Gerenciar vitrine</h2>
                <p className="text-sm text-zinc-500">
                  Adicione veículos do estoque para esta loja diariamente.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {veiculosDisponiveis.length} disponíveis
              </span>
            </header>
            {!lojaSelecionada ? (
              <div className="rounded-md border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">
                Selecione uma loja para gerenciar a vitrine.
              </div>
            ) : isEstoqueLoading ? (
              <div className="rounded-md border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">
                Carregando veículos do estoque...
              </div>
            ) : veiculosDisponiveis.length === 0 ? (
              <div className="rounded-md border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">
                Todos os veículos do estoque já estão nesta vitrine.
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {veiculosDisponiveis.map((veiculo) => (
                  <li key={veiculo.id}>
                    <article className="flex h-full flex-col gap-4 rounded-lg border border-dashed border-zinc-300 bg-white/80 p-5 text-sm text-zinc-600 shadow-sm opacity-75">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-zinc-800">
                          {veiculo.veiculoDisplay}
                        </h3>
                        <p className="text-xs uppercase text-zinc-400">Placa {veiculo.placa}</p>
                        <p className="text-xs text-zinc-500">
                          Local atual: {veiculo.localDisplay ?? "Sem local"}
                        </p>
                      </div>
                      <dl className="grid gap-3 text-xs text-zinc-500 sm:grid-cols-2">
                        <div>
                          <dt className="font-medium text-zinc-700">Ano</dt>
                          <dd>{veiculo.anoPrincipal ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-zinc-700">Hodômetro</dt>
                          <dd>{veiculo.hodometroFormatado ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-zinc-700">Status</dt>
                          <dd>{veiculo.estadoVendaLabel}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-zinc-700">Preço base</dt>
                          <dd>{veiculo.precoFormatado ?? "Não informado"}</dd>
                        </div>
                      </dl>
                      <div className="mt-auto">
                        <AddVehicleToStoreButton
                          veiculoId={veiculo.id}
                          empresaId={veiculo.empresa_id}
                          preco={veiculo.preco_venal}
                          onAdded={() => {
                            /* keeps panel open, data revalida */
                          }}
                        />
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
