"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Search, X } from "lucide-react";

import { LojaSelector } from "@/components/LojaSelector";
import { RenderCards } from "@/components/render-cards";
import { useLojaStore } from "@/stores/useLojaStore";
import {
  useVeiculosLojaUI,
  type VeiculoLojaUI,
} from "@/adapters/adaptador-vitrine";
import { useVeiculosUI, type VeiculoUI } from "@/adapters/adaptador-estoque";
import { AddVehicleToStoreButton } from "./loja-actions";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";
import { useCaracteristicas } from "@/hooks/use-configuracoes";

import { Grid, Rows, Table } from "lucide-react";
type ViewMode = "cards-photo" | "cards-info" | "table";
type Ordenacao = "recentes" | "preco-desc" | "preco-asc" | "modelo";
// ✅ NOVO: mapa de emojis p/ cada modo
const VIEW_MODE_ICON: Record<ViewMode, React.ElementType> = {
  "cards-photo": Grid,
  "cards-info": Rows,
  table: Table,
};

const VIEW_MODE_ORDER: ViewMode[] = ["cards-photo", "cards-info", "table"];

const VIEW_MODE_STORAGE_KEY = "vitrine:view-mode";
const FILTERS_OPEN_STORAGE_KEY = "vitrine:filters-open";
const SEARCH_OPEN_STORAGE_KEY = "vitrine:search-open";
const STATUS_VALUE_STORAGE_KEY = "vitrine:status-value";
const CHARACTERISTIC_VALUE_STORAGE_KEY = "vitrine:characteristic-value";
const PRICE_MIN_VALUE_STORAGE_KEY = "vitrine:price-min-value";
const PRICE_MAX_VALUE_STORAGE_KEY = "vitrine:price-max-value";
const SORT_VALUE_STORAGE_KEY = "vitrine:sort-value";

const isValidViewMode = (value: string): value is ViewMode =>
  VIEW_MODE_ORDER.includes(value as ViewMode);

const ORDENACAO_LABEL: Record<Ordenacao, string> = {
  recentes: "Mais recentes",
  "preco-desc": "Maior preço",
  "preco-asc": "Menor preço",
  modelo: "Modelo (A-Z)",
};

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


export default function VitrinePage() {
  const lojaSelecionada = useLojaStore((state) => state.lojaSelecionada);
  const lojaId = lojaSelecionada?.id;

  const { data: empresa } = useEmpresaDoUsuario();
  const { data: caracteristicas = [] } = useCaracteristicas();

  // ❌ REMOVA este inicializador antigo:
  // const [filtersOpen, setFiltersOpen] = useState<boolean>(() => {
  //   if (typeof window === "undefined") return true;
  //   const stored = window.localStorage.getItem(FILTERS_OPEN_STORAGE_KEY);
  //   return stored === null ? true : stored === "true";
  // });

  // ✅ USE este, com default estável no SSR/CSR (sem window)
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(true);

  // ❌ REMOVA este inicializador antigo:
  // const [viewMode, setViewMode] = useState<ViewMode>(() => {
  //   if (typeof window === "undefined") return "cards-photo";
  //   const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  //   return stored && isValidViewMode(stored) ? stored : "cards-photo";
  // });

  // ✅ USE este, com default estável no SSR/CSR
  const [viewMode, setViewMode] = useState<ViewMode>("cards-photo");

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoVendaFiltro | "">("");
  const [caracteristicaFiltro, setCaracteristicaFiltro] = useState<string>("");
  const [precoMin, setPrecoMin] = useState<string>("");
  const [precoMax, setPrecoMax] = useState<string>("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recentes");
  const [isManaging, setIsManaging] = useState(false);

  const handleCycleViewMode = () => {
    setViewMode((prev) => {
      const currentIndex = VIEW_MODE_ORDER.indexOf(prev);
      const nextIndex = (currentIndex + 1) % VIEW_MODE_ORDER.length;
      return VIEW_MODE_ORDER[nextIndex];
    });
  };

  // ✅ Carrega preferências do cliente pós-mount (evita mismatch)
  useEffect(() => {
    try {
      const storedFilters = window.localStorage.getItem(FILTERS_OPEN_STORAGE_KEY);
      if (storedFilters !== null) {
        setFiltersOpen(storedFilters === "true");
      }

      const storedSearch = window.localStorage.getItem("vitrine:search-open");
      if (storedSearch !== null) {
        setSearchOpen(storedSearch === "true");
      }

      const storedView = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (storedView && isValidViewMode(storedView)) {
        setViewMode(storedView);
      }

      const storedStatus = window.localStorage.getItem(STATUS_VALUE_STORAGE_KEY);
      if (storedStatus && ESTADOS_VENDA.includes(storedStatus as EstadoVendaFiltro)) {
        setEstadoFiltro(storedStatus as EstadoVendaFiltro);
      }

      const storedCharacteristic = window.localStorage.getItem(CHARACTERISTIC_VALUE_STORAGE_KEY);
      if (storedCharacteristic) {
        setCaracteristicaFiltro(storedCharacteristic);
      }

      const storedMin = window.localStorage.getItem(PRICE_MIN_VALUE_STORAGE_KEY);
      if (storedMin) {
        setPrecoMin(storedMin);
      }

      const storedMax = window.localStorage.getItem(PRICE_MAX_VALUE_STORAGE_KEY);
      if (storedMax) {
        setPrecoMax(storedMax);
      }

      const storedSort = window.localStorage.getItem(SORT_VALUE_STORAGE_KEY);
      if (storedSort && Object.keys(ORDENACAO_LABEL).includes(storedSort)) {
        setOrdenacao(storedSort as Ordenacao);
      }

    } catch {
      // se o storage estiver bloqueado, siga com os defaults
    }
  }, []);


  useEffect(() => {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    window.localStorage.setItem(FILTERS_OPEN_STORAGE_KEY, String(filtersOpen));
  }, [filtersOpen]);

  useEffect(() => {
    window.localStorage.setItem(SEARCH_OPEN_STORAGE_KEY, String(searchOpen));
  }, [searchOpen]);

  useEffect(() => {
    window.localStorage.setItem(STATUS_VALUE_STORAGE_KEY, estadoFiltro);
  }, [estadoFiltro]);

  useEffect(() => {
    window.localStorage.setItem(CHARACTERISTIC_VALUE_STORAGE_KEY, caracteristicaFiltro);
  }, [caracteristicaFiltro]);

  useEffect(() => {
    window.localStorage.setItem(PRICE_MIN_VALUE_STORAGE_KEY, precoMin);
  }, [precoMin]);

  useEffect(() => {
    window.localStorage.setItem(PRICE_MAX_VALUE_STORAGE_KEY, precoMax);
  }, [precoMax]);

  useEffect(() => {
    window.localStorage.setItem(SORT_VALUE_STORAGE_KEY, ordenacao);
  }, [ordenacao]);

  const temFiltrosAtivos = useMemo(() => {
  return (
    searchTerm.trim() !== "" ||
    estadoFiltro !== "" ||
    caracteristicaFiltro !== "" ||
    precoMin.trim() !== "" ||
    precoMax.trim() !== ""
  );
}, [searchTerm, estadoFiltro, caracteristicaFiltro, precoMin, precoMax]);


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

    const ordenaPorPreco = (veiculo: VeiculoLojaUI) => {
      const precoReferencia =
        typeof veiculo.precoLoja === "number" ? veiculo.precoLoja : veiculo.veiculo?.preco_venal ?? null;
      return precoReferencia;
    };

    const ordenaPorData = (veiculo: VeiculoLojaUI) => {
      const datas = [veiculo.dataEntrada, veiculo.veiculo?.registrado_em].filter(Boolean) as string[];
      if (!datas.length) return 0;
      const timestamp = Date.parse(datas[0]!);
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    const aplicado = veiculosLoja.filter((item) => {
      const veiculo = item.veiculo;
      if (!veiculo) return false;

      const atendeEstado = estadoFiltro ? veiculo.estado_venda === estadoFiltro : true;

      if (!atendeEstado) return false;

      const atendeCaracteristica = caracteristicaFiltro
        ? (veiculo.caracteristicas ?? []).some((caracteristica: { id: string }) => caracteristica?.id === caracteristicaFiltro)
        : true;

      if (!atendeCaracteristica) return false;

      const precoReferencia = ordenaPorPreco(item);

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
    const comparador = (a: VeiculoLojaUI, b: VeiculoLojaUI) => {
      switch (ordenacao) {
        case "preco-asc": {
          const precoA = ordenaPorPreco(a);
          const precoB = ordenaPorPreco(b);
          if (precoA == null && precoB == null) return 0;
          if (precoA == null) return 1;
          if (precoB == null) return -1;
          return precoA - precoB;
        }
        case "preco-desc": {
          const precoA = ordenaPorPreco(a);
          const precoB = ordenaPorPreco(b);
          if (precoA == null && precoB == null) return 0;
          if (precoA == null) return 1;
          if (precoB == null) return -1;
          return precoB - precoA;
        }
        case "modelo": {
          const modeloA = a.veiculo?.veiculoDisplay ?? "";
          const modeloB = b.veiculo?.veiculoDisplay ?? "";
          return modeloA.localeCompare(modeloB, "pt-BR", { sensitivity: "base" });
        }
        case "recentes":
        default: {
          const dataA = ordenaPorData(a);
          const dataB = ordenaPorData(b);
          return dataB - dataA;
        }
      }
    };

    return aplicado.sort(comparador);
  }, [veiculosLoja, searchTerm, estadoFiltro, caracteristicaFiltro, precoMin, precoMax, ordenacao]);

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
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] py-16 text-center text-sm text-[var(--text-secondary)]">
          Seleciona uma loja para visualizar a vitrine de veículos.
        </div>
      );
    }

    return (
      <RenderCards
        vehicles={filtrados}
        viewMode={viewMode}
        domain="vitrine"
        isLoading={isLoading}
      />
    );
  };

  // Barra fixa: medir altura p/ criar um spacer e evitar sobreposição
  const barRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(0);

  useEffect(() => {
    const measure = () => setBarH(barRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);


  return (
    <div className="bg-[var(--bg-primary)] px-6 py-10 text-[var(--text-primary)]">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Vitrine de veículos</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Explore e compartilhe os veículos disponíveis na loja selecionada.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-4 shadow-sm">
            <LojaSelector />
          </div>
        </div>

        {/* 🔒 Barra de pesquisa/filtros sempre visível no topo */}
        {searchOpen && <section
          ref={barRef}
          className="
    fixed inset-x-0 top-0 z-50
    border-b border-[var(--border)]
    bg-[var(--bg-primary)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-primary)]/75
  "
        >
          {/* Conteúdo centralizado no mesmo grid da página */}
          <div className="mx-auto w-full max-w-6xl px-6 pt-4 pb-3">
            {/* Cabeçalho de controle */}
            <div className="flex items-center justify-between">
              <label className="flex w-full items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-secondary)] focus-within:border-[var(--purple-dark)] focus-within:ring-2 focus-within:ring-[var(--purple-pale)] sm:max-w-lg">
                <span className="text-xs font-semibold uppercase text-[var(--text-tertiary)]">Pesq.:</span>
                <input
                  type="search"
                  placeholder="Modelo, placa, local..."
                  className="h-8 w-full border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  className="rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--purple-dark)] hover:text-[var(--text-primary)]"
                >
                  {filtersOpen ? "Ocultar filtros ▲" : "Mostrar filtros ▼"}
                </button>

                {empresa?.papel === "proprietario" && (
                  <button
                    type="button"
                    onClick={handleToggleManage}
                    disabled={!lojaSelecionada}
                    className={`rounded-md border px-3 py-2 text-xs font-medium transition ${isManaging
                        ? "border-[var(--purple-dark)] bg-[var(--purple-pale)] text-[var(--purple-darker)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--purple-dark)] hover:text-[var(--text-primary)]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {isManaging ? "Fechar gestão" : "Gerenciar vitrine"}
                  </button>
                )}

                {(() => {
                  const Icon = VIEW_MODE_ICON[viewMode];
                  return (
                    <button
                      type="button"
                      onClick={handleCycleViewMode}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--purple-dark)] text-[var(--white-pure)] shadow-sm transition hover:bg-[var(--purple-darker)]"
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Filtros colapsáveis */}
            {filtersOpen && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <select
                  value={estadoFiltro}
                  onChange={(event) => setEstadoFiltro(event.target.value as EstadoVendaFiltro | "")}
                  className="h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)] focus:border-[var(--purple-dark)] focus:ring-2 focus:ring-[var(--purple-pale)] bg-[var(--bg-primary)]"
                >
                  <option value="">Todos os status</option>
                  {ESTADOS_VENDA.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>

                <select
                  value={caracteristicaFiltro}
                  onChange={(event) => setCaracteristicaFiltro(event.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)] focus:border-[var(--purple-dark)] focus:ring-2 focus:ring-[var(--purple-pale)] bg-[var(--bg-primary)]"
                >
                  <option value="">Todas as características</option>
                  {caracteristicas.map((caracteristica) => (
                    <option key={caracteristica.id} value={caracteristica.id}>
                      {caracteristica.nome}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Preço mínimo"
                  value={precoMin}
                  onChange={(event) => setPrecoMin(event.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)] focus:border-[var(--purple-dark)] focus:ring-2 focus:ring-[var(--purple-pale)] bg-[var(--bg-primary)] placeholder:text-[var(--text-tertiary)]"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Preço máximo"
                  value={precoMax}
                  onChange={(event) => setPrecoMax(event.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)] focus:border-[var(--purple-dark)] focus:ring-2 focus:ring-[var(--purple-pale)] bg-[var(--bg-primary)] placeholder:text-[var(--text-tertiary)]"
                />

                <select
                  value={ordenacao}
                  onChange={(event) => setOrdenacao(event.target.value as Ordenacao)}
                  className="h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm text-[var(--text-secondary)] focus:border-[var(--purple-dark)] focus:ring-2 focus:ring-[var(--purple-pale)] bg-[var(--bg-primary)]"
                >
                  {Object.entries(ORDENACAO_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>}

        {/* 🔍 Botão flutuante para mostrar/ocultar */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="
    fixed bottom-6 right-6 z-50
    flex items-center justify-center
    h-14 w-14 rounded-full
    bg-[var(--purple-dark)] text-[var(--white-pure)] shadow-lg
    transition hover:bg-[var(--purple-darker)] active:scale-95
  "
          aria-label="Alternar pesquisa"
        >
          {searchOpen ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
        </button>

        {/* ⛳️ Spacer para não sobrepor o conteúdo (altura da barra fixa) */}

        {lojaSelecionada ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
            <span>
              Loja selecionada: <strong className="text-[var(--text-primary)]">{lojaSelecionada.nome}</strong>
            </span>
            <span className="inline-flex items-center rounded-full bg-[var(--purple-pale)] px-3 py-1 text-xs font-medium text-[var(--purple-darker)]">
              {total} veículos encontrados
            </span>
          </div>
        ) : null}
        {temFiltrosAtivos && (
  <div className="mt-3 flex items-center gap-3 text-sm">
    <span className="inline-flex items-center gap-2 rounded-md border border-[var(--warning-pale)] bg-[var(--warning-pale)] px-3 py-1.5 text-[var(--warning)] shadow-sm">
      <span className="text-base">🔎</span>
      <span>Filtrando resultados</span>
    </span>
    <button
      type="button"
      onClick={() => {
        setSearchTerm("");
        setEstadoFiltro("");
        setCaracteristicaFiltro("");
        setPrecoMin("");
        setPrecoMax("");
      }}
      className="text-xs font-medium text-[var(--purple-dark)] hover:text-[var(--purple-darker)]"
    >
      Limpar filtros
    </button>
  </div>
)}

      </header>

      <main className="mx-auto mt-8 w-auto max-w-6xl">
        {renderConteudo()}
        {isManaging && (
          <section className="mt-10 space-y-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Gerenciar vitrine</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Adicione veículos do estoque para esta loja diariamente.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[var(--purple-pale)] px-3 py-1 text-xs font-semibold text-[var(--purple-darker)]">
                {veiculosDisponiveis.length} disponíveis
              </span>
            </header>
            {!lojaSelecionada ? (
              <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-primary)] p-6 text-sm text-[var(--text-secondary)]">
                Selecione uma loja para gerenciar a vitrine.
              </div>
            ) : isEstoqueLoading ? (
              <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-primary)] p-6 text-sm text-[var(--text-secondary)]">
                Carregando veículos do estoque...
              </div>
            ) : veiculosDisponiveis.length === 0 ? (
              <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-primary)] p-6 text-sm text-[var(--text-secondary)]">
                Todos os veículos do estoque já estão nesta vitrine.
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {veiculosDisponiveis.map((veiculo) => (
                  <li key={veiculo.id}>
                    <article className="flex h-full flex-col gap-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-primary)]/80 p-5 text-sm text-[var(--text-secondary)] shadow-sm opacity-75">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">
                          {veiculo.veiculoDisplay}
                        </h3>
                        <p className="text-xs uppercase text-[var(--text-tertiary)]">Placa {veiculo.placa}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Local atual: {veiculo.localDisplay ?? "Sem local"}
                        </p>
                      </div>
                      <dl className="grid gap-3 text-xs text-[var(--text-secondary)] sm:grid-cols-2">
                        <div>
                          <dt className="font-medium text-[var(--text-primary)]">Ano</dt>
                          <dd>{veiculo.anoPrincipal ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-[var(--text-primary)]">Hodômetro</dt>
                          <dd>{veiculo.hodometroFormatado ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-[var(--text-primary)]">Status</dt>
                          <dd>{veiculo.estadoVendaLabel}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-[var(--text-primary)]">Preço base</dt>
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
