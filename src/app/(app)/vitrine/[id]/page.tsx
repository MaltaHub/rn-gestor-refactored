"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FormEvent,
  PointerEvent as ReactPointerEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEmpresaDoUsuario } from "@/hooks/use-empresa";

import {
  useVeiculoLojaUI,
  veiculosLojaKeys,
} from "@/adapters/adaptador-vitrine";
import {
  useFotosVeiculoLoja,
  type FotoVeiculoLoja,
} from "@/hooks/use-fotos-veiculo-loja";
import { useLocais, useLojas } from "@/hooks/use-configuracoes";
import { useLojaStore } from "@/stores/useLojaStore";
import { atualizarVeiculo } from "@/services/estoque";
import { atualizarPrecoVeiculoLoja } from "@/services/vitrine";
import { invalidateVeiculos } from "@/hooks/use-estoque";
import { RemoveVehicleFromStoreButton } from "../loja-actions";
import type { Caracteristica } from "@/types";

const ESTADOS_VENDA = [
  "disponivel",
  "reservado",
  "vendido",
  "repassado",
  "restrito",
] as const;

type EstadoVenda = (typeof ESTADOS_VENDA)[number];
type ActionType = "local" | "status" | "preco";

const formatEnumLabel = (value?: string | null) =>
  value
    ? value
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Não informado";

function getImageUrl(url: string, w = 800, q = 80) {
  return `${url}?width=${w}&quality=${q}&format=webp`;
}

export default function VitrineDetalhePage() {
  const params = useParams<{ id: string }>();
  const veiculoLojaId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const {data: empresa, isLoading: isLoadingEmpresa} = useEmpresaDoUsuario()

  const { data: veiculoLoja, isLoading } = useVeiculoLojaUI(veiculoLojaId);
  const { data: locais = [] } = useLocais();
  const { data: lojas = [] } = useLojas();

  const setLojaSelecionada = useLojaStore((state) => state.setLojaSelecionada);
  const lojaAtualId = useLojaStore((state) => state.lojaSelecionada?.id ?? null);
  const queryClient = useQueryClient();

  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [localSelecionado, setLocalSelecionado] = useState<string>("");
  const [statusSelecionado, setStatusSelecionado] = useState<EstadoVenda | "">(
    ""
  );
  const [precoLoja, setPrecoLoja] = useState<string>("");

  const [feedback, setFeedback] = useState<{
    action: ActionType;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState<ActionType | null>(null);

  const veiculo = veiculoLoja?.veiculo ?? null;

  const lojaNomePorId = useMemo(() => {
    const mapa = new Map<string, string>();
    lojas.forEach((loja) => {
      if (loja.id) {
        mapa.set(loja.id, loja.nome);
      }
    });
    return mapa;
  }, [lojas]);

  const localOptions = useMemo(() => {
    return locais
      .map((local) => {
        const pertenceALoja = local.loja_id ? local.loja_id === veiculoLoja?.lojaId : false;
        const lojaNome = local.loja_id ? lojaNomePorId.get(local.loja_id) ?? null : null;
        const label = lojaNome ? `${lojaNome} • ${local.nome}` : local.nome;
        const prioridade = pertenceALoja ? 0 : local.loja_id ? 1 : 2;
        return {
          value: local.id,
          label,
          pertenceALoja,
          prioridade,
        } as const;
      })
      .sort((a, b) => {
        if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
        return a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" });
      });
  }, [locais, lojaNomePorId, veiculoLoja?.lojaId]);

  const possuiUnidadeDaLoja = localOptions.some((option) => option.pertenceALoja);

  // sincroniza loja selecionada
  useEffect(() => {
    if (veiculoLoja?.loja && veiculoLoja.loja.id !== lojaAtualId) {
      setLojaSelecionada(veiculoLoja.loja);
    }
  }, [veiculoLoja?.loja, setLojaSelecionada, lojaAtualId]);

  // inicializa selects/inputs
  useEffect(() => {
    if (!veiculoLoja) return;
    setLocalSelecionado(veiculoLoja.veiculo?.local?.id ?? "");
    setStatusSelecionado(
      (veiculoLoja.veiculo?.estado_venda as EstadoVenda) ?? ""
    );
    setPrecoLoja(
      typeof veiculoLoja.precoLoja === "number"
        ? veiculoLoja.precoLoja.toString()
        : ""
    );
  }, [veiculoLoja]);

  // fotos
  const {
    data: fotos = [],
    isLoading: isFotosLoading,
  } = useFotosVeiculoLoja({
    empresaId: veiculoLoja?.empresaId,
    lojaId: veiculoLoja?.lojaId,
    veiculoId: veiculoLoja?.veiculoId,
  });

  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const miniaturasRef = useRef<HTMLDivElement | null>(null);
  const imagensPrefetchRef = useRef<Set<string>>(new Set<string>());
  const swipeStartRef = useRef<number | null>(null);
  const [mostrarTodasCaracteristicas, setMostrarTodasCaracteristicas] = useState(false);

  // rola a miniatura ativa para o centro do trilho
  useEffect(() => {
    const track = miniaturasRef.current;
    if (!track) return;
    const active = track.children?.[fotoAtiva] as HTMLElement | undefined;
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [fotoAtiva]);

  // reseta foto ativa quando a lista muda
  useEffect(() => {
    setFotoAtiva(0);
    setMostrarTodasCaracteristicas(false);
  }, [fotos.length]);

  useEffect(() => {
    setMostrarTodasCaracteristicas(false);
  }, [veiculoLoja?.id]);

  useEffect(() => {
    const track = miniaturasRef.current;
    if (!track) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };

    track.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      track.removeEventListener("wheel", handleWheel);
    };
  }, [fotos.length]);

  // pré-carrega TODAS as fotos (até 30 é ok)
  useEffect(() => {
    if (!fotos.length) return;
    const cache = imagensPrefetchRef.current;
    fotos.forEach((f: FotoVeiculoLoja) => {
      if (!f?.url || cache.has(f.url)) return;
      cache.add(f.url);
      const img = new window.Image();
      img.src = f.url;
    });
  }, [fotos]);

  const fotoAtual = useMemo(() => fotos[fotoAtiva] ?? null, [fotos, fotoAtiva]);

  const goToPrevFoto = useCallback(() => {
    if (!fotos.length) return;
    setFotoAtiva((prev) => (prev - 1 + fotos.length) % fotos.length);
  }, [fotos.length]);

  const goToNextFoto = useCallback(() => {
    if (!fotos.length) return;
    setFotoAtiva((prev) => (prev + 1) % fotos.length);
  }, [fotos.length]);

  const handleSwipeStart = useCallback((clientX: number | null) => {
    swipeStartRef.current = clientX;
  }, []);

  const handleSwipeEnd = useCallback(
    (clientX: number | null) => {
      const start = swipeStartRef.current;
      if (start == null || clientX == null) {
        swipeStartRef.current = null;
        return;
      }

      const delta = clientX - start;
      const SWIPE_THRESHOLD = 40;
      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        if (delta < 0) {
          goToNextFoto();
        } else {
          goToPrevFoto();
        }
      }

      swipeStartRef.current = null;
    },
    [goToNextFoto, goToPrevFoto],
  );

  const handleOverlayPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      handleSwipeStart(event.clientX);
    },
    [handleSwipeStart],
  );

  const handleOverlayPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      handleSwipeEnd(event.clientX);
    },
    [handleSwipeEnd],
  );

  const handleOpenFocusMode = useCallback(() => {
    if (!fotoAtual) return;
    setIsFocusMode(true);
  }, [fotoAtual]);

  const handleOpenFocusModeKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!fotoAtual) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsFocusMode(true);
      }
    },
    [fotoAtual],
  );

  const sortCaracteristicas = (lista: string[]) =>
    [...lista].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));

  const todasCaracteristicas = useMemo(() => {
    const itens = (veiculo?.caracteristicas ?? []) as Caracteristica[];
    const nomes = itens
      .map((item: Caracteristica | null) => item?.nome ?? null)
      .filter((nome: string | null): nome is string => Boolean(nome && nome.trim() !== ""));

    if (nomes.length === 0) return sortCaracteristicas(veiculo?.caracteristicasPrincipais ?? []);

    const unicos = Array.from(new Set(nomes.map((nome) => nome.trim())));
    return sortCaracteristicas(unicos);
  }, [veiculo?.caracteristicas, veiculo?.caracteristicasPrincipais]);

  const caracteristicasVisiveis = useMemo(() => {
    if (mostrarTodasCaracteristicas) return todasCaracteristicas;
    const principais = veiculo?.caracteristicasPrincipais ?? [];
    return sortCaracteristicas(principais);
  }, [mostrarTodasCaracteristicas, todasCaracteristicas, veiculo?.caracteristicasPrincipais]);

  const extrasDisponiveis = Math.max(
    todasCaracteristicas.length - (veiculo?.caracteristicasPrincipais?.length ?? 0),
    0,
  );

  const handleCloseFeedback = () => setFeedback(null);

  const invalidateVitrineQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: veiculosLojaKeys.detalhe(veiculoLojaId),
      }),
      queryClient.invalidateQueries({
        queryKey: veiculosLojaKeys.lista(veiculoLoja?.lojaId),
      }),
    ]);
    invalidateVeiculos(queryClient);
  };

  // updates
  const handleUpdateLocal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!veiculoLoja?.veiculoId) return;
    setIsSaving("local");
    setFeedback(null);
    try {
      await atualizarVeiculo(veiculoLoja.veiculoId, {
        local_id: localSelecionado === "" ? null : localSelecionado,
      });
      await invalidateVitrineQueries();
      setFeedback({
        action: "local",
        type: "success",
        message: "Local atualizado com sucesso.",
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        action: "local",
        type: "error",
        message: "Não foi possível atualizar o local.",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleUpdateStatus = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!veiculoLoja?.veiculoId) return;
    if (!statusSelecionado) return;
    setIsSaving("status");
    setFeedback(null);
    try {
      await atualizarVeiculo(veiculoLoja.veiculoId, {
        estado_venda: statusSelecionado,
      });
      await invalidateVitrineQueries();
      setFeedback({
        action: "status",
        type: "success",
        message: "Status de venda atualizado.",
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        action: "status",
        type: "error",
        message: "Não foi possível atualizar o status.",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleUpdatePreco = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!veiculoLojaId) return;
    setIsSaving("preco");
    setFeedback(null);
    try {
      const valorNormalizado = precoLoja.trim();
      const numero =
        valorNormalizado === ""
          ? null
          : Number(valorNormalizado.replace(/,/g, "."));
      if (numero !== null && Number.isNaN(numero)) {
        throw new Error("Informe um valor numérico válido.");
      }
      await atualizarPrecoVeiculoLoja(veiculoLojaId, numero);
      await invalidateVitrineQueries();
      setPrecoLoja(numero === null ? "" : String(numero));
      setFeedback({
        action: "preco",
        type: "success",
        message: "Preço da loja atualizado.",
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        action: "preco",
        type: "error",
        message:
          error instanceof Error ? error.message : "Erro ao atualizar o preço.",
      });
    } finally {
      setIsSaving(null);
    }
  };

  // keybindings para galeria
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) {
        e.preventDefault();
        setIsFocusMode(false);
        return;
      }

      if (!fotos.length) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevFoto();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNextFoto();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fotos.length, goToNextFoto, goToPrevFoto, isFocusMode]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isFocusMode) {
      swipeStartRef.current = null;
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      swipeStartRef.current = null;
    };
  }, [isFocusMode]);

  if (!veiculoLojaId) {
    return (
      <div className="px-6 py-10 text-zinc-600">
        <p>Identificador inválido.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-6 py-10 text-zinc-600">
        <p>Carregando informações da vitrine...</p>
      </div>
    );
  }

  if (!veiculoLoja || !veiculo) {
    return (
      <div className="px-6 py-10 text-zinc-600">
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-6">
          <p className="text-sm">Veículo não encontrado para esta vitrine.</p>
          <Link
            href="/vitrine"
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Voltar para vitrine
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {isFocusMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 py-6"
          onClick={() => setIsFocusMode(false)}
        >
          <div
            className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center gap-6"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={handleOverlayPointerDown}
            onPointerUp={handleOverlayPointerUp}
            onPointerLeave={(event) => handleSwipeEnd(event.clientX)}
            onPointerCancel={() => handleSwipeEnd(null)}
          >
            <button
              type="button"
              onClick={() => setIsFocusMode(false)}
              className="absolute right-4 top-4 z-10 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Fechar visualização em foco"
            >
              Fechar
            </button>

            {fotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPrevFoto();
                  }}
                  className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-xl text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Foto anterior"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToNextFoto();
                  }}
                  className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-xl text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Próxima foto"
                >
                  →
                </button>
              </>
            )}

            <div className="relative flex w-full flex-1 items-center justify-center">
              {fotoAtual ? (
                <div className="relative h-full w-full">
                  <Image
                    src={getImageUrl(fotoAtual.url, 1920, 95)}
                    alt={veiculo?.veiculoDisplay ?? "Foto do veículo"}
                    fill
                    className="select-none object-contain"
                    sizes="100vw"
                    priority
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
                  Nenhuma foto disponível
                </div>
              )}
            </div>

            {fotos.length > 0 && (
              <div className="flex items-center gap-3 text-sm font-medium text-white/80">
                <span>{veiculo?.veiculoDisplay}</span>
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                  {fotoAtiva + 1} / {fotos.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white px-6 py-10 text-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link
            href="/vitrine"
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            ← Voltar para a vitrine
          </Link>
        </header>

        {/* BLOCO DE FOTOS */}
        <section className="flex flex-col gap-2">
          {/* Foto principal — altura responsiva, sem corte */}
          <div
            role="button"
            tabIndex={fotoAtual ? 0 : -1}
            onClick={handleOpenFocusMode}
            onKeyDown={handleOpenFocusModeKeyDown}
            className={`relative w-full overflow-hidden bg-zinc-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 sm:rounded-lg sm:border sm:border-zinc-200 ${
              fotoAtual ? "cursor-zoom-in" : "cursor-not-allowed opacity-70"
            }`}
            aria-label="Ampliar foto"
            aria-disabled={!fotoAtual}
          >
            <div className="relative h-[68vh] min-h-[320px] max-h-[820px]">
              {isFotosLoading ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
                  Carregando fotos...
                </div>
              ) : fotoAtual ? (
                <Image
                  src={getImageUrl(fotoAtual.url, 1200, 90)}
                  alt={veiculo?.veiculoDisplay ?? "Foto do veículo"}
                  fill
                  className="object-contain select-none"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1200px"
                  priority
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
                  Nenhuma foto cadastrada
                </div>
              )}
            </div>

            {fotos.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToPrevFoto();
                  }}
                  className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow transition hover:bg-white"
                  aria-label="Foto anterior"
                >
                  ←
                </button>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow">
                  {fotoAtiva + 1} / {fotos.length}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goToNextFoto();
                  }}
                  className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow transition hover:bg-white"
                  aria-label="Próxima foto"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Miniaturas com rolagem horizontal invisível (confinada ao container) */}
          {fotos.length > 1 && (
            <div className="sm:mx-0">
              <div className="relative">
                {/* fades nas laterais */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent sm:rounded-l-lg" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:rounded-r-lg" />

                <div
                  ref={miniaturasRef}
                  className="
                    flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar
                    pb-2 px-4 h-20 snap-x snap-mandatory touch-pan-x
                    overscroll-x-contain w-full max-w-full
                  "
                >
                  {fotos.map((foto, index) => (
                    <button
                      key={foto.id}
                      type="button"
                      onClick={() => setFotoAtiva(index)}
                      className={`relative h-20 aspect-square flex-shrink-0 overflow-hidden rounded-md border transition snap-start
                        ${
                          fotoAtiva === index
                            ? "border-blue-500 ring-2 ring-blue-300"
                            : "border-transparent"
                        }`}
                      aria-current={fotoAtiva === index}
                      aria-label={`Miniatura ${index + 1}`}
                    >
                      <Image
                        src={getImageUrl(foto.url, 120, 60)}
                        alt={`Foto ${index + 1}`}
                        fill
                        className="object-cover object-center pointer-events-none select-none"
                        sizes="80px"
                        draggable={false}
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* BLOCO DE INFORMAÇÕES */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {veiculo.veiculoDisplay}
              </h1>
              <p className="text-sm text-zinc-500">
                Loja {veiculoLoja.lojaNome ?? "não informada"} • Placa{" "}
                {veiculo.placa}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-600">
                {veiculo.estadoVendaLabel}
              </span>
              <span className="text-xl font-semibold text-zinc-900">
                {veiculoLoja.precoLojaFormatado ??
                  veiculo.precoFormatado ??
                  "Sem preço"}
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">
                Informações principais
              </h2>
              <dl className="mt-4 grid gap-4 text-sm text-zinc-600 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-zinc-700">Modelo</dt>
                  <dd>{veiculo.modeloDisplay}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-700">Placa</dt>
                  <dd>{veiculo.placa}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-700">Ano</dt>
                  <dd>{veiculo.anoPrincipal ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-700">Hodômetro</dt>
                  <dd>{veiculo.hodometroFormatado ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-700">
                    Estado do veículo
                  </dt>
                  <dd>{veiculo.estadoVeiculoLabel}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-700">Documentação</dt>
                  <dd>{veiculo.estagio_documentacao ?? "Sem informação"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-700">Local atual</dt>
                  <dd>{veiculo.localDisplay ?? "Sem local"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-700">Disponível desde</dt>
                  <dd>{veiculoLoja.dataEntradaFormatada ?? "—"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">Valores</h2>
              <div className="mt-4 grid gap-4 text-sm text-zinc-600 sm:grid-cols-2">
                <div>
                  <span className="font-medium text-zinc-700">
                    Preço na loja
                  </span>
                  <p>{veiculoLoja.precoLojaFormatado ?? "Não definido"}</p>
                </div>
                <div>
                  <span className="font-medium text-zinc-700">
                    Preço padrão (veículo)
                  </span>
                  <p>{veiculo.precoFormatado ?? "Não informado"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">
                Características
              </h2>
              {caracteristicasVisiveis.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">
                  Nenhuma característica cadastrada.
                </p>
              ) : (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {caracteristicasVisiveis.map((item: string) => (
                      <span
                        key={item}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  {extrasDisponiveis > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setMostrarTodasCaracteristicas((prev) => !prev)
                      }
                      aria-expanded={mostrarTodasCaracteristicas}
                      className="mt-3 inline-flex w-fit items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      {mostrarTodasCaracteristicas
                        ? "Mostrar menos características"
                        : `Ver todas (+${extrasDisponiveis})`}
                    </button>
                  )}
                </>
              )}
              {veiculo.observacao && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-zinc-700">
                    Observações
                  </h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-zinc-600">
                    {veiculo.observacao}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* AÇÕES RÁPIDAS */}
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Ações rápidas
              </h2>
              <p className="text-sm text-zinc-500">
                Ajuste o local do veículo, o status de venda ou o preço
                específico desta loja.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() =>
                  setActiveAction((c) => (c === "local" ? null : "local"))
                }
                className={`rounded-md border px-3 py-2 font-medium transition ${
                  activeAction === "local"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                }`}
              >
                Alterar local
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveAction((c) => (c === "status" ? null : "status"))
                }
                className={`rounded-md border px-3 py-2 font-medium transition ${
                  activeAction === "status"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                }`}
              >
                Alterar status
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveAction((c) => (c === "preco" ? null : "preco"))
                }
                className={`rounded-md border px-3 py-2 font-medium transition ${
                  activeAction === "preco"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                }`}
              >
                Alterar valor
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`mt-4 rounded-md border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span>{feedback.message}</span>
                <button
                  type="button"
                  onClick={handleCloseFeedback}
                  className="text-xs font-medium uppercase tracking-wide text-inherit/70"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {activeAction === "local" && (
            <form className="mt-6 space-y-4" onSubmit={handleUpdateLocal}>
              <div className="flex flex-col gap-2 text-sm text-zinc-600">
                <label className="font-medium text-zinc-700" htmlFor="local">
                  Selecione o novo local interno
                </label>
                <select
                  id="local"
                  value={localSelecionado}
                  onChange={(e) => setLocalSelecionado(e.target.value)}
                  className="h-10 rounded-md border border-zinc-200 px-3 text-sm text-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Sem local vinculado</option>
                  {localOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {!possuiUnidadeDaLoja && veiculoLoja?.loja?.nome ? (
                  <span className="text-xs text-zinc-500">
                    Nenhuma unidade cadastrada para {veiculoLoja.loja.nome}. Cadastre uma em configurações.
                  </span>
                ) : null}
              </div>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                disabled={isSaving === "local"}
              >
                {isSaving === "local" ? "Salvando..." : "Salvar local"}
              </button>
            </form>
          )}

          {activeAction === "status" && (
            <form className="mt-6 space-y-4" onSubmit={handleUpdateStatus}>
              <div className="flex flex-col gap-2 text-sm text-zinc-600">
                <label className="font-medium text-zinc-700" htmlFor="status">
                  Status de venda
                </label>
                <select
                  id="status"
                  value={statusSelecionado}
                  onChange={(e) =>
                    setStatusSelecionado(e.target.value as EstadoVenda)
                  }
                  className="h-10 rounded-md border border-zinc-200 px-3 text-sm text-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="" disabled>
                    Selecione um status
                  </option>
                  {ESTADOS_VENDA.map((estado) => (
                    <option key={estado} value={estado}>
                      {formatEnumLabel(estado)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                disabled={isSaving === "status"}
              >
                {isSaving === "status" ? "Salvando..." : "Salvar status"}
              </button>
            </form>
          )}

          {activeAction === "preco" && (
            <form className="mt-6 space-y-4" onSubmit={handleUpdatePreco}>
              <div className="flex flex-col gap-2 text-sm text-zinc-600">
                <label className="font-medium text-zinc-700" htmlFor="preco">
                  Valor deste veículo na loja (R$)
                </label>
                <input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precoLoja}
                  onChange={(e) => setPrecoLoja(e.target.value)}
                  className="h-10 rounded-md border border-zinc-200 px-3 text-sm text-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Informe o valor"
                />
                <p className="text-xs text-zinc-500">
                  Valor atual: {veiculoLoja.precoLojaFormatado ?? "não definido"}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                disabled={isSaving === "preco"}
              >
                {isSaving === "preco" ? "Salvando..." : "Salvar preço"}
              </button>
            </form>
          )}

          {!isLoadingEmpresa && empresa?.papel === "proprietario" &&
            <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-red-700">
                  Remover veículo desta vitrine
                </h3>
                <p className="text-xs text-red-600">
                  Ao remover, o veículo continuará disponível no estoque geral.
                </p>
              </div>
              <RemoveVehicleFromStoreButton
                veiculoLojaId={veiculoLoja.id}
                redirectTo="/vitrine"
                onRemoved={() => setActiveAction(null)}
              />
            </div>
          </div>}
        </section>
      </div>
    </div>
    </>
  );
}
