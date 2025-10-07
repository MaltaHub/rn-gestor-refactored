"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useVeiculosUI, type VeiculoUI } from "@/adapters/adaptador-estoque";
import { useLocais } from "@/hooks/use-configuracoes";
import { Search, X } from "lucide-react";

/* =========================
 * Constantes / Utils
 * ========================= */
const ESTADOS_VENDA: VeiculoUI["estado_venda"][] = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
];

const SEM_LOCAL_VALUE = "__sem_local__";

type SortKey =
  | "veiculoDisplay"
  | "placa"
  | "anoPrincipal"
  | "hodometro"
  | "estadoVendaLabel"
  | "estadoVeiculoLabel"
  | "localDisplay"
  | "preco_venal"
  | "estagio_documentacao"
  | "cor";

type SortDirection = "asc" | "desc";

type SortConfig = {
  key: SortKey;
  direction: SortDirection;
};

const sortAccessors: Record<SortKey, (item: VeiculoUI) => string | number | null> = {
  veiculoDisplay: (item) => item.veiculoDisplay,
  placa: (item) => item.placa,
  anoPrincipal: (item) => item.anoPrincipal,
  hodometro: (item) => (typeof item.hodometro === "number" ? item.hodometro : null),
  estadoVendaLabel: (item) => item.estadoVendaLabel,
  estadoVeiculoLabel: (item) => item.estadoVeiculoLabel,
  localDisplay: (item) => item.localDisplay,
  preco_venal: (item) => (typeof item.preco_venal === "number" ? item.preco_venal : null),
  estagio_documentacao: (item) => item.estagio_documentacao ?? null,
  cor: (item) => item.cor ?? null,
};

const compareBySort = (a: VeiculoUI, b: VeiculoUI, config: SortConfig) => {
  const valueA = sortAccessors[config.key](a);
  const valueB = sortAccessors[config.key](b);

  if (valueA == null && valueB == null) return 0;
  if (valueA == null) return config.direction === "asc" ? 1 : -1;
  if (valueB == null) return config.direction === "asc" ? -1 : 1;

  if (typeof valueA === "number" && typeof valueB === "number") {
    return config.direction === "asc" ? valueA - valueB : valueB - valueA;
  }

  const comparison = valueA
    .toString()
    .localeCompare(valueB.toString(), "pt-BR", { sensitivity: "base" });

  return config.direction === "asc" ? comparison : -comparison;
};

const TABLE_COLUMNS: Array<{ label: string; sortKey?: SortKey; align?: "right" }> = [
  { label: "Veículo", sortKey: "veiculoDisplay" },
  { label: "Placa", sortKey: "placa" },
  { label: "Ano", sortKey: "anoPrincipal" },
  { label: "Hodômetro", sortKey: "hodometro" },
  { label: "Estado venda", sortKey: "estadoVendaLabel" },
  { label: "Estado veículo", sortKey: "estadoVeiculoLabel" },
  { label: "Local", sortKey: "localDisplay" },
  { label: "Preço", sortKey: "preco_venal", align: "right" },
  { label: "Documentação", sortKey: "estagio_documentacao" },
  { label: "Cor", sortKey: "cor" },
  { label: "Ações", align: "right" },
];

const formatEstadoLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

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

/* =========================
 * Persistência (localStorage)
 * ========================= */
const LS_KEYS = {
  viewMode: "estoque:viewMode",              // "cards" | "table"
  searchTerm: "estoque:searchTerm",          // string
  localScope: "estoque:localScope",          // "todos" | "showroom" | "fora"
  localFiltro: "estoque:localFiltro",        // string (local id / __sem_local__)
  modeloFiltro: "estoque:modeloFiltro",      // string (modeloCompleto)
  sortConfig: "estoque:sortConfig",
  searchOpen: "estoque:searchOpen",
  // {key, direction}
} as const;

const isValidView = (v: string | null): v is "cards" | "table" =>
  v === "cards" || v === "table";

const isValidScope = (v: string | null): v is "todos" | "showroom" | "fora" =>
  v === "todos" || v === "showroom" || v === "fora";

/* =========================
 * Página
 * ========================= */
export default function EstoquePage() {
  const { data: veiculos = [], isLoading } = useVeiculosUI();
  const { data: todosLocais = [] } = useLocais();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // estado via URL (mantém comportamento original)
  const estadoFiltroParam = searchParams.get("estado");
  const estadoFiltro =
    estadoFiltroParam && ESTADOS_VENDA.includes(estadoFiltroParam as VeiculoUI["estado_venda"])
      ? (estadoFiltroParam as VeiculoUI["estado_venda"])
      : null;

  // ===== Estados com defaults estáveis (SSR-safe) =====
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [localScope, setLocalScope] = useState<"todos" | "showroom" | "fora">("todos");
  const [localFiltro, setLocalFiltro] = useState("");
  const [modeloFiltro, setModeloFiltro] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // ===== Refs para busca e ancoragem =====
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());

  const headerRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [barHeight, setBarHeight] = useState(0);

  useEffect(() => {
    if (!searchOpen) return; // só mede quando estiver visível
    const section = barRef.current;
    if (!section) return;

    // Define altura inicial
    const atualizarAltura = () => {
      setBarHeight(section.offsetHeight);
    };

    atualizarAltura();

    // Atualiza se redimensionar a tela
    window.addEventListener("resize", atualizarAltura);

    // Observa mudanças dinâmicas de altura
    const observer = new ResizeObserver(atualizarAltura);
    observer.observe(section);



    return () => {
      window.removeEventListener("resize", atualizarAltura);
      observer.disconnect();
    };
  }, [searchOpen]);


  // Medir alturas para ancoragem (barra fixa logo abaixo do header)
  useEffect(() => {
    const measure = () => {
      setBarHeight(headerRef.current?.offsetHeight ?? 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* =========================
   * Carregar do localStorage (hydrate)
   * ========================= */
  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_KEYS.viewMode);
      if (isValidView(v)) setViewMode(v);

      const t = localStorage.getItem(LS_KEYS.searchTerm);
      if (t != null) setSearchTerm(t);

      const s = localStorage.getItem(LS_KEYS.localScope);
      if (isValidScope(s)) setLocalScope(s);

      const lf = localStorage.getItem(LS_KEYS.localFiltro);
      if (lf != null) setLocalFiltro(lf);

      const mf = localStorage.getItem(LS_KEYS.modeloFiltro);
      if (mf != null) setModeloFiltro(mf);

      const so = localStorage.getItem(LS_KEYS.searchOpen);
      if (so === "true") setSearchOpen(true);

      const sc = localStorage.getItem(LS_KEYS.sortConfig);
      if (sc) {
        try {
          const parsed = JSON.parse(sc);
          if (parsed && parsed.key && parsed.direction) {
            setSortConfig(parsed as SortConfig);
          }
        } catch { }
      }
    } catch { }
  }, []);

  /* =========================
   * Salvar no localStorage
   * ========================= */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.viewMode, viewMode);
    } catch { }
  }, [viewMode]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.searchOpen, searchOpen ? "true" : "false");
    } catch { }
  }, [searchOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.searchTerm, searchTerm);
    } catch { }
  }, [searchTerm]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.localScope, localScope);
    } catch { }
  }, [localScope]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.localFiltro, localFiltro);
    } catch { }
  }, [localFiltro]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.modeloFiltro, modeloFiltro);
    } catch { }
  }, [modeloFiltro]);

  useEffect(() => {
    try {
      if (sortConfig) {
        localStorage.setItem(LS_KEYS.sortConfig, JSON.stringify(sortConfig));
      } else {
        localStorage.removeItem(LS_KEYS.sortConfig);
      }
    } catch { }
  }, [sortConfig]);

  const temFiltrosAtivos = useMemo(() => {
    return (
      searchTerm.trim() !== "" ||
      localScope !== "todos" ||
      localFiltro !== "" ||
      modeloFiltro !== ""
      // precoMin != null ||
      // precoMax != null
    );
  }, [searchTerm, estadoFiltro, localFiltro, modeloFiltro]);


  /* =========================
   * Dados derivados e filtros
   * ========================= */
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

  const localOptionsData = useMemo(() => {
    const showroom: { value: string; label: string }[] = [];
    const fora: { value: string; label: string }[] = [];
    const todos: { value: string; label: string }[] = [];

    const orderByLabel = (list: { value: string; label: string }[]) =>
      [...list].sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }));

    for (const local of todosLocais) {
      if (!local?.id || !local.nome) continue;
      const option = { value: local.id, label: local.nome };
      todos.push(option);
      if (local.loja_id) {
        showroom.push(option);
      } else {
        fora.push(option);
      }
    }

    const sortedShowroom = orderByLabel(showroom);
    let sortedFora = orderByLabel(fora);
    let sortedTodos = orderByLabel(todos);

    const hasVeiculoSemLocal = veiculos.some((item) => !item.local?.id);
    if (hasVeiculoSemLocal) {
      const semLocalOption = { value: SEM_LOCAL_VALUE, label: "Sem local vinculado" };
      sortedFora = [...sortedFora, semLocalOption];
      sortedTodos = [...sortedTodos, semLocalOption];
    }

    const toValueSet = (list: { value: string; label: string }[]) => new Set(list.map((item) => item.value));

    return {
      options: {
        todos: sortedTodos,
        showroom: sortedShowroom,
        fora: sortedFora,
      },
      values: {
        todos: toValueSet(sortedTodos),
        showroom: toValueSet(sortedShowroom),
        fora: toValueSet(sortedFora),
      },
    } as const;
  }, [todosLocais, veiculos]);

  const localOptions = useMemo(() => localOptionsData.options[localScope], [localOptionsData, localScope]);

  const localPlaceholderLabel = useMemo(() => {
    if (localScope === "showroom") return "Todas as unidades";
    if (localScope === "fora") return "Todos os locais fora das unidades";
    return "Todos os locais";
  }, [localScope]);

  // Se o localFiltro atual não existe no escopo selecionado, zera
  useEffect(() => {
    if (!localFiltro) return;
    const validValues = localOptionsData.values[localScope];
    if (!validValues.has(localFiltro)) {
      setLocalFiltro("");
    }
  }, [localFiltro, localOptionsData, localScope]);

  // Se o modelo salvo não existe mais, zera
  const uniqueModelos = useMemo(() => {
    const set = new Set<string>();
    veiculos.forEach((veiculo) => {
      const modelo = veiculo.modeloCompleto;
      if (modelo) set.add(modelo);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
  }, [veiculos]);

  useEffect(() => {
    if (modeloFiltro && !uniqueModelos.includes(modeloFiltro)) {
      setModeloFiltro("");
    }
  }, [modeloFiltro, uniqueModelos]);

  const veiculosFiltrados = useMemo(() => {
    return veiculos.filter((veiculo) => {
      if (estadoFiltro && veiculo.estado_venda !== estadoFiltro) return false;

      if (localScope === "showroom" && !veiculo.estaEmUnidade) return false;
      if (localScope === "fora" && veiculo.estaEmUnidade) return false;

      if (localFiltro) {
        if (localFiltro === SEM_LOCAL_VALUE) {
          if (veiculo.local?.id) return false;
        } else if (veiculo.local?.id !== localFiltro) {
          return false;
        }
      }

      if (modeloFiltro && veiculo.modeloCompleto !== modeloFiltro) return false;
      return true;
    });
  }, [estadoFiltro, localFiltro, localScope, modeloFiltro, veiculos]);

  const veiculosOrdenados = useMemo(() => {
    if (!sortConfig) return veiculosFiltrados;
    return [...veiculosFiltrados].sort((a, b) => compareBySort(a, b, sortConfig));
  }, [sortConfig, veiculosFiltrados]);

  // highlight temporário ao navegar por busca
  useEffect(() => {
    if (!highlightedId) return;
    const timeout = window.setTimeout(() => setHighlightedId(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [highlightedId]);

  useEffect(() => {
    setHighlightedId(null);
  }, [estadoFiltro, localFiltro, localScope, modeloFiltro, viewMode, searchTerm, sortConfig]);

  const totalVeiculos = veiculos.length;
  const totalFiltrados = veiculosFiltrados.length;

  /* =========================
   * Handlers
   * ========================= */
  // Adicione acima do handleSearchSubmit
const [searchMatches, setSearchMatches] = useState<string[]>([]);
const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

// Substitua o handleSearchSubmit existente
const handleSearchSubmit = useCallback(
  (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const normalizedTerm = normalizeText(searchTerm);

    if (!normalizedTerm) {
      searchInputRef.current?.focus();
      return;
    }

    // 1️⃣ Filtra todos os veículos que combinam com o termo
    const matches = veiculosOrdenados
      .filter((v) => matchesSearchTerm(v, normalizedTerm))
      .map((v) => v.id);

    if (matches.length === 0) {
      console.log("Nenhum resultado encontrado para:", normalizedTerm);
      return;
    }

    // 2️⃣ Atualiza lista de correspondências e índice atual
    setSearchMatches(matches);

    // Se é a primeira busca, começa do primeiro; senão vai para o próximo
    setCurrentMatchIndex((prev) => {
      const nextIndex = (prev + 1) % matches.length;
      const targetId = matches[nextIndex];
      const element = itemRefs.current.get(targetId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(targetId);
      }

      return nextIndex;
    });
  },
  [veiculosOrdenados, searchTerm],
);

useEffect(() => {
  setSearchMatches([]);
  setCurrentMatchIndex(0);
}, [searchTerm]);

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

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" } as SortConfig;
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" } as SortConfig;
      }
      return null; // terceira batida limpa a ordenação
    });
  }, []);

  const getSortIndicator = useCallback(
    (key: SortKey) => {
      if (!sortConfig || sortConfig.key !== key) return "";
      return sortConfig.direction === "asc" ? "A-Z" : "Z-A";
    },
    [sortConfig],
  );

  /* =========================
   * Renders
   * ========================= */
  const renderCards = useCallback(
    () => (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {veiculosOrdenados.map((veiculo) => {
          const precoFormatado = veiculo.precoFormatado;
          const hodometroFormatado = veiculo.hodometroFormatado ?? "—";
          const caracteristicasResumo = veiculo.caracteristicasPrincipais;
          const isHighlighted = highlightedId === veiculo.id;

          return (
            <li key={veiculo.id} ref={registerItemRef(veiculo.id)} className="h-full">
              <article
                className={`flex h-full flex-col justify-between rounded-lg border bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md ${isHighlighted ? "border-blue-500 ring-2 ring-blue-200" : "border-zinc-200"
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
    ),
    [veiculosOrdenados, highlightedId, registerItemRef],
  );

  const renderTabela = useCallback(
    () => (
      <div className="rounded-lg border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] divide-y divide-zinc-200">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                {TABLE_COLUMNS.map((column) => {
                  const alignmentClass = column.align === "right" ? "text-right" : "";

                  if (!column.sortKey) {
                    return (
                      <th key={column.label} className={`px-4 py-3 ${alignmentClass}`}>
                        {column.label}
                      </th>
                    );
                  }

                  const isSorted = sortConfig?.key === column.sortKey;
                  const ariaSort: "ascending" | "descending" | "none" = isSorted
                    ? sortConfig?.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none";
                  const indicator = getSortIndicator(column.sortKey);
                  const indicatorLabel = indicator || "A-Z";
                  const indicatorClass = indicator ? "text-blue-600" : "text-zinc-400";

                  return (
                    <th key={column.label} className={`px-4 py-3 ${alignmentClass}`} aria-sort={ariaSort}>
                      <button
                        type="button"
                        onClick={() => handleSort(column.sortKey!)}
                        className="flex w-full items-center justify-between gap-2 uppercase transition hover:text-blue-600 focus:outline-none"
                      >
                        <span>{column.label}</span>
                        <span className={`text-[0.65rem] font-semibold ${indicatorClass}`}>{indicatorLabel}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white text-sm text-zinc-600">
              {veiculosOrdenados.map((veiculo) => {
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
                    <td className="px-4 py-3 text-right">{veiculo.precoFormatado ?? "—"}</td>
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
    ),
    [getSortIndicator, handleSort, veiculosOrdenados, highlightedId, registerItemRef, sortConfig],
  );

  /* =========================
   * Render principal
   * ========================= */
  return (
    <div className="bg-white px-6 py-10 text-zinc-900">

      {/* 🔒 BARRA FIXA: pesquisa + filtros, ancorada no topo (logo abaixo do header) */}
      {searchOpen &&
        <>
          <section
            id="sessao-busca-filtros"
            ref={barRef}
            className="
    fixed inset-x-0 top-0 z-50
    border-b border-zinc-200
    bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75
  "
          >
            <div className="mx-auto w-full max-w-5xl px-6 pt-4 pb-3">
              <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
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
                  aria-label="Buscar"
                >
                  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  <span>Buscar</span>
                </button>
              </form>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex flex-1 flex-wrap gap-2">
                  <select
                    value={localScope}
                    onChange={(event) => setLocalScope(event.target.value as "todos" | "showroom" | "fora")}
                    className="h-10 flex-1 rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:flex-initial sm:min-w-[200px]"
                  >
                    <option value="todos">Todos os locais</option>
                    <option value="showroom">Showroom (unidades)</option>
                    <option value="fora">Fora das unidades</option>
                  </select>

                  <select
                    value={localFiltro}
                    onChange={(event) => setLocalFiltro(event.target.value)}
                    className="h-10 flex-1 rounded-md border border-zinc-200 px-3 text-sm text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:flex-initial sm:min-w-[200px]"
                  >
                    <option value="">{localPlaceholderLabel}</option>
                    {localOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
            </div>
          </section>

          <main
            style={{ marginTop: `${barHeight}px` }}
            className="mx-auto mt-6 w-full max-w-5xl">
              
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
                  setLocalFiltro("");
                  setLocalScope("todos");
                  setModeloFiltro("");
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Limpar filtros
              </button>
            </div>
          )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
                <p className="text-base font-medium text-zinc-600">Carregando veículos do estoque...</p>
              </div>
            ) : veiculosFiltrados.length === 0 ? (
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
        </>
      }

      {!searchOpen &&
        <>
          {/* HEADER (medido p/ posicionar a barra fixa logo abaixo) */}
          <header ref={headerRef} className="mx-auto w-full max-w-5xl">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Estoque de Veículos</h1>
                <p className="text-sm text-zinc-500">Visualize, edite e cadastre veículos disponíveis nas lojas.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 sm:inline-flex">
                  {veiculosFiltrados.length} de {veiculos.length} veículos
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
                className={`rounded-full border px-3 py-1.5 transition ${!estadoFiltro
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800"
                  }`}
              >
                Todos
                <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs text-zinc-500">{veiculos.length}</span>
              </Link>
              {ESTADOS_VENDA.map((estado) => {
                const active = estadoFiltro === estado;
                const href = `${pathname}?estado=${estado}`;
                return (
                  <Link
                    key={estado}
                    href={href}
                    className={`rounded-full border px-3 py-1.5 transition ${active
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
                  setLocalFiltro("");
                  setLocalScope("todos");
                  setModeloFiltro("");
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* CONTEÚDO */}
          <main className="mx-auto mt-6 w-full max-w-5xl">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
                <p className="text-base font-medium text-zinc-600">Carregando veículos do estoque...</p>
              </div>
            ) : veiculosFiltrados.length === 0 ? (
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
        </>
      }

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
    </div>
  );
}
