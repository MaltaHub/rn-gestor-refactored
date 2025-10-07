"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";

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
  <ul className="grid max-w-screen-xl grid-cols-1 gap-6 px-4 mx-auto sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
    {veiculos.map((item) => (
      <li key={item.id} className="flex flex-col h-full w-full">
        <article className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
          <Link href={`/vitrine/${item.id}`} className="block h-full w-full">
            {/* Imagem */}
            <div className="relative aspect-video w-full bg-zinc-100 overflow-hidden">
              {item.capaUrl ? (
                <Image
                  src={item.capaUrl}
                  alt={item.veiculo?.veiculoDisplay ?? "Veículo sem foto"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  priority={false}
                />
              ) : (
                <span className="flex h-full items-center justify-center text-xs sm:text-sm font-medium text-zinc-500">
                  Sem foto de capa
                </span>
              )}
            </div>

            {/* Conteúdo */}
            <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5 min-h-0 break-words">
              {/* Badge + Preço */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-shrink-0">{renderEstadoBadge(item)}</div>
                <span className="flex-shrink-0 text-sm sm:text-base lg:text-lg font-semibold text-zinc-800 truncate">
                  {getDisplayPrice(item)}
                </span>
              </div>

              {/* Título + Placa */}
              <div>
                <h4 className="text-sm sm:text-base lg:text-lg font-bold text-zinc-800 clamp-2 leading-tight">
                  {item.veiculo?.veiculoDisplay ?? "Veículo sem modelo"}
                </h4>
                <p className="text-xs sm:text-sm lg:text-base text-zinc-500">
                  Placa {item.veiculo?.placa ?? "—"}
                </p>
              </div>

              {/* Informações */}
              <dl className="grid gap-3 text-xs sm:text-sm lg:text-base text-zinc-500 sm:grid-cols-2">
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

              {item.veiculo?.caracteristicasPrincipais?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.veiculo.caracteristicasPrincipais.slice(0, 3).map((caracteristica: string) => (
                    <span
                      key={caracteristica}
                      className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700"
                    >
                      {caracteristica}
                    </span>
                  ))}
                  {item.veiculo.caracteristicasPrincipais.length > 3 && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-500">
                      +{item.veiculo.caracteristicasPrincipais.length - 3} mais
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
                  {item.veiculo.caracteristicasPrincipais.slice(0, 4).map((caracteristica: string) => (
                    <span
                      key={caracteristica}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {caracteristica}
                    </span>
                  ))}
                  {item.veiculo.caracteristicasPrincipais.length > 4 && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-500">
                      +{item.veiculo.caracteristicasPrincipais.length - 4} mais
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

import { useRouter } from "next/navigation"; // ⬅️ adicione no topo
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const renderTabela = (veiculos: VeiculoLojaUI[], router: AppRouterInstance) => {

  return (
    <div className="rounded-lg border border-zinc-200">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-zinc-200">
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>

          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Fotos</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 bg-white text-sm text-zinc-600">
            {veiculos.map((item) => (
              <tr
                key={item.id}
                onClick={() => router.push(`/vitrine/${item.id}`)}
                className="cursor-pointer select-none transition-colors hover:bg-blue-50/40 active:bg-blue-100 focus:bg-blue-100"
              >
                <td className="px-4 py-3 whitespace-nowrap align-middle">
                  <span className="block overflow-hidden text-ellipsis font-medium text-zinc-800">
                    {item.veiculo?.veiculoDisplay ?? "Veículo"}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap align-middle">
                  <span className="block overflow-hidden text-ellipsis">
                    {item.veiculo?.placa ?? "—"}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap align-middle">
                  <span className="block overflow-hidden text-ellipsis">
                    {getDisplayPrice(item)}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap align-middle">
                  <span className="block overflow-hidden text-ellipsis">
                    {item.veiculo?.estadoVendaLabel ?? "Sem status"}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap align-middle">
                  <span className="block overflow-hidden text-ellipsis">
                    {item.veiculo?.localDisplay ?? "Sem local"}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap align-middle">
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-zinc-700">
                    {item.temFotos ? "Sim" : "Não"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function VitrinePage() {
  const router = useRouter(); // ⬅️ adicione no topo do componente
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

    if (viewMode === "table") return renderTabela(filtrados, router);
    if (viewMode === "cards-info") return renderInfoCards(filtrados);
    return renderGridCards(filtrados);
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

        {/* 🔒 Barra de pesquisa/filtros sempre visível no topo */}
        {searchOpen && <section
          ref={barRef}
          className="
    fixed inset-x-0 top-0 z-50
    border-b border-zinc-200
    bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75
  "
        >
          {/* Conteúdo centralizado no mesmo grid da página */}
          <div className="mx-auto w-full max-w-6xl px-6 pt-4 pb-3">
            {/* Cabeçalho de controle */}
            <div className="flex items-center justify-between">
              <label className="flex w-full items-center gap-3 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 sm:max-w-lg">
                <span className="text-xs font-semibold uppercase text-zinc-400">Pesq.:</span>
                <input
                  type="search"
                  placeholder="Modelo, placa, local..."
                  className="h-8 w-full border-none bg-transparent text-sm text-zinc-700 outline-none"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                >
                  {filtersOpen ? "Ocultar filtros ▲" : "Mostrar filtros ▼"}
                </button>

                {empresa?.papel === "proprietario" && (
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

                {(() => {
                  const Icon = VIEW_MODE_ICON[viewMode];
                  return (
                    <button
                      type="button"
                      onClick={handleCycleViewMode}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
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
                  className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Preço máximo"
                  value={precoMax}
                  onChange={(event) => setPrecoMax(event.target.value)}
                  className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <select
                  value={ordenacao}
                  onChange={(event) => setOrdenacao(event.target.value as Ordenacao)}
                  className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
    bg-blue-600 text-white shadow-lg
    transition hover:bg-blue-700 active:scale-95
  "
          aria-label="Alternar pesquisa"
        >
          {searchOpen ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
        </button>

        {/* ⛳️ Spacer para não sobrepor o conteúdo (altura da barra fixa) */}

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
        {temFiltrosAtivos && (
  <div className="mt-3 flex items-center gap-3 text-sm">
    <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 shadow-sm">
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
      className="text-xs font-medium text-blue-600 hover:text-blue-800"
    >
      Limpar filtros
    </button>
  </div>
)}

      </header>

      <main className="mx-auto mt-8 w-auto max-w-6xl">
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
