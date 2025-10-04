"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  useVeiculoLojaUI,
  veiculosLojaKeys,
} from "@/adapters/adaptador-vitrine";
import {
  useFotosVeiculoLoja,
  type FotoVeiculoLoja,
} from "@/hooks/use-fotos-veiculo-loja";
import { useLocais } from "@/hooks/use-configuracoes";
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

  const { data: veiculoLoja, isLoading } = useVeiculoLojaUI(veiculoLojaId);
  const { data: locais = [] } = useLocais();

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
  const miniaturasRef = useRef<HTMLDivElement | null>(null);
  const imagensPrefetchRef = useRef<Set<string>>(new Set<string>());
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
      if (!fotos.length) return;
      if (e.key === "ArrowLeft") {
        setFotoAtiva((p) => (p - 1 + fotos.length) % fotos.length);
      } else if (e.key === "ArrowRight") {
        setFotoAtiva((p) => (p + 1) % fotos.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fotos.length]);

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
          <div className="relative w-full overflow-hidden sm:rounded-lg sm:border sm:border-zinc-200 bg-zinc-100 shadow-sm">
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
                  onClick={() =>
                    setFotoAtiva((prev) => (prev - 1 + fotos.length) % fotos.length)
                  }
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
                  onClick={() => setFotoAtiva((prev) => (prev + 1) % fotos.length)}
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
                  {locais.map((local) => (
                    <option key={local.id} value={local.id}>
                      {local.nome}
                    </option>
                  ))}
                </select>
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
          </div>
        </section>
      </div>
    </div>
  );
}
