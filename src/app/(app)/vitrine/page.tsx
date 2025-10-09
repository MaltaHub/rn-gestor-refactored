"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Search, X, Grid, Rows, Table, Filter, FileDown } from "lucide-react";

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
import { ESTADOS_VENDA as ESTADOS_VENDA_CONFIG, STORAGE_KEYS } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
type ViewMode = "cards-photo" | "cards-info" | "table";
type Ordenacao = "recentes" | "preco-desc" | "preco-asc" | "modelo";
// ✅ NOVO: mapa de emojis p/ cada modo
const VIEW_MODE_ICON: Record<ViewMode, React.ElementType> = {
  "cards-photo": Grid,
  "cards-info": Rows,
  table: Table,
};

const VIEW_MODE_ORDER: ViewMode[] = ["cards-photo", "cards-info", "table"];

const VIEW_MODE_STORAGE_KEY = STORAGE_KEYS.vitrine.viewMode;
const FILTERS_OPEN_STORAGE_KEY = STORAGE_KEYS.vitrine.filtersOpen;
const SEARCH_OPEN_STORAGE_KEY = STORAGE_KEYS.vitrine.searchOpen;
const STATUS_VALUE_STORAGE_KEY = STORAGE_KEYS.vitrine.statusValue;
const CHARACTERISTIC_VALUE_STORAGE_KEY = STORAGE_KEYS.vitrine.characteristicValue;
const PRICE_MIN_VALUE_STORAGE_KEY = STORAGE_KEYS.vitrine.priceMin;
const PRICE_MAX_VALUE_STORAGE_KEY = STORAGE_KEYS.vitrine.priceMax;
const SORT_VALUE_STORAGE_KEY = STORAGE_KEYS.vitrine.sortValue;

const isValidViewMode = (value: string): value is ViewMode =>
  VIEW_MODE_ORDER.includes(value as ViewMode);

const ORDENACAO_LABEL: Record<Ordenacao, string> = {
  recentes: "Mais recentes",
  "preco-desc": "Maior preço",
  "preco-asc": "Menor preço",
  modelo: "Modelo (A-Z)",
};

const ESTADOS_VENDA = ESTADOS_VENDA_CONFIG;

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
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 py-16 text-center text-sm text-gray-600 dark:text-gray-400">
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
    <div className="min-h-screen bg-white dark:bg-gray-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <header 
        className="mx-auto flex w-full max-w-7xl flex-col gap-6 transition-all"
        style={{ paddingTop: searchOpen && barH > 0 ? `${barH}px` : '0px' }}
      >
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Vitrine de veículos</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore e compartilhe os veículos disponíveis na loja selecionada
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Card variant="default" className="w-full lg:w-auto">
              <Card.Body className="p-4">
                <LojaSelector />
              </Card.Body>
            </Card>
            <Button
              variant="outline"
              size="md"
              leftIcon={<FileDown className="h-4 w-4" />}
              onClick={() => alert('Gerar PDF em breve!')}
            >
              PDF
            </Button>
          </div>
        </div>

        {/* 🔒 Barra de pesquisa/filtros sempre visível no topo */}
        {searchOpen && <section
          ref={barRef}
          className="
    fixed inset-x-0 top-0 z-50
    border-b border-gray-200 dark:border-gray-700
    bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-gray-900/75
  "
        >
          {/* Conteúdo centralizado no mesmo grid da página */}
          <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-3 sm:px-6 lg:px-8">
            {/* Cabeçalho de controle */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 sm:max-w-md">
                <Input
                  type="search"
                  placeholder="Buscar por modelo, placa, local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                  inputSize="md"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Filter className="h-4 w-4" />}
                  onClick={() => setFiltersOpen((prev) => !prev)}
                >
                  {filtersOpen ? "Ocultar" : "Filtros"}
                </Button>

                {empresa?.papel === "proprietario" && (
                  <Button
                    variant={isManaging ? "primary" : "outline"}
                    size="sm"
                    onClick={handleToggleManage}
                    disabled={!lojaSelecionada}
                  >
                    {isManaging ? "Fechar gestão" : "Gerenciar"}
                  </Button>
                )}

                {(() => {
                  const Icon = VIEW_MODE_ICON[viewMode];
                  return (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCycleViewMode}
                      className="!p-2"
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  );
                })()}
              </div>
            </div>

            {/* Filtros colapsáveis */}
            {filtersOpen && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value as EstadoVendaFiltro | "")}
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none transition-all"
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
                  onChange={(e) => setCaracteristicaFiltro(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none transition-all"
                >
                  <option value="">Todas as características</option>
                  {caracteristicas.map((caracteristica) => (
                    <option key={caracteristica.id} value={caracteristica.id}>
                      {caracteristica.nome}
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Preço mínimo"
                  value={precoMin}
                  onChange={(e) => setPrecoMin(e.target.value)}
                  inputSize="sm"
                />

                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Preço máximo"
                  value={precoMax}
                  onChange={(e) => setPrecoMax(e.target.value)}
                  inputSize="sm"
                />

                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none transition-all"
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
        <Button
          variant="primary"
          size="md"
          onClick={() => setSearchOpen(!searchOpen)}
          className="!fixed bottom-6 right-6 z-50 !h-14 !w-14 !rounded-full !p-0 shadow-lg"
          aria-label="Alternar pesquisa"
        >
          {searchOpen ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
        </Button>

        {lojaSelecionada ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Loja selecionada: <strong className="font-bold text-gray-900 dark:text-gray-100">{lojaSelecionada.nome}</strong>
            </span>
            <Badge 
              variant="info"
              customColors={{
                bg: 'var(--purple-pale)',
                text: 'var(--purple-darker)'
              }}
            >
              {total} veículos
            </Badge>
          </div>
        ) : null}
        {temFiltrosAtivos && (
  <div className="mt-3 flex flex-wrap items-center gap-3">
    <Badge 
      variant="warning"
      customColors={{
        bg: 'var(--warning-pale)',
        text: 'var(--warning)'
      }}
      className="gap-2"
    >
      <Search className="h-3.5 w-3.5" />
      Filtrando resultados
    </Badge>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setSearchTerm("");
        setEstadoFiltro("");
        setCaracteristicaFiltro("");
        setPrecoMin("");
        setPrecoMax("");
      }}
    >
      Limpar filtros
    </Button>
  </div>
)}

      </header>

      <main className="mx-auto mt-8 w-full max-w-7xl">
        {renderConteudo()}
        {isManaging && (
          <Card variant="default" className="mt-10">
            <Card.Header>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Gerenciar vitrine</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Adicione veículos do estoque para esta loja
                  </p>
                </div>
                <Badge 
                  variant="info"
                  customColors={{
                    bg: 'var(--purple-pale)',
                    text: 'var(--purple-darker)'
                  }}
                >
                  {veiculosDisponiveis.length} disponíveis
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
            {!lojaSelecionada ? (
              <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-6 text-sm text-gray-600 dark:text-gray-400">
                Selecione uma loja para gerenciar a vitrine.
              </div>
            ) : isEstoqueLoading ? (
              <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-6 text-sm text-gray-600 dark:text-gray-400">
                Carregando veículos do estoque...
              </div>
            ) : veiculosDisponiveis.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-6 text-sm text-gray-600 dark:text-gray-400">
                Todos os veículos do estoque já estão nesta vitrine.
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {veiculosDisponiveis.map((veiculo) => (
                  <li key={veiculo.id}>
                    <article className="flex h-full flex-col gap-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 p-5 text-sm shadow-sm opacity-75 hover:opacity-100 transition-opacity duration-300">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                          {veiculo.veiculoDisplay}
                        </h3>
                        <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Placa {veiculo.placa}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Local atual: {veiculo.localDisplay ?? "Sem local"}
                        </p>
                      </div>
                      <dl className="grid gap-3 text-xs sm:grid-cols-2">
                        <div>
                          <dt className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Ano</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{veiculo.anoPrincipal ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Hodômetro</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{veiculo.hodometroFormatado ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{veiculo.estadoVendaLabel}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Preço base</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{veiculo.precoFormatado ?? "Não informado"}</dd>
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
            </Card.Body>
          </Card>
        )}
      </main>
    </div>
  );
}
