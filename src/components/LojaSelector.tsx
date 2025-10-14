"use client";

import { useEffect, useMemo } from "react";
import { Building2, ChevronDown, Loader2 } from "lucide-react";

import { useLojaStore } from "@/stores/useLojaStore";
import { useLojas } from "@/hooks/use-configuracoes";

export function LojaSelector() {
  const { data: lojas = [], isLoading } = useLojas();
  const lojaSelecionada = useLojaStore((state) => state.lojaSelecionada);
  const setLojaSelecionada = useLojaStore((state) => state.setLojaSelecionada);

  const lojasDisponiveis = useMemo(
    () => lojas.filter((loja) => Boolean(loja?.id && loja?.nome)),
    [lojas],
  );

  useEffect(() => {
    if (!isLoading && lojasDisponiveis.length > 0) {
      const selecionadaAindaExiste = lojaSelecionada
        ? lojasDisponiveis.some((loja) => loja.id === lojaSelecionada.id)
        : false;

      if (!selecionadaAindaExiste) {
        setLojaSelecionada(lojasDisponiveis[0]);
      }
    }
  }, [isLoading, lojasDisponiveis, lojaSelecionada, setLojaSelecionada]);

  const selectedId = useMemo(() => {
    if (lojaSelecionada && lojasDisponiveis.some((loja) => loja.id === lojaSelecionada.id)) {
      return lojaSelecionada.id ?? "";
    }
    return lojasDisponiveis[0]?.id ?? "";
  }, [lojaSelecionada, lojasDisponiveis]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Selecionando loja…
        </span>
        <div className="flex h-11 w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/60">
          <Loader2
            aria-hidden="true"
            className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400"
          />
          <span className="sr-only">Carregando lojas</span>
        </div>
      </div>
    );
  }

  if (!lojasDisponiveis.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300">
        Nenhuma loja disponível no momento.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="loja-selector"
        className="text-sm font-semibold text-gray-700 dark:text-gray-200"
      >
        Loja ativa
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <Building2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <select
          id="loja-selector"
          className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-9 pr-10 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          value={selectedId}
          onChange={(event) => {
            const loja = lojasDisponiveis.find(
              (item) => item.id === event.target.value,
            );
            if (loja) {
              setLojaSelecionada(loja);
            }
          }}
        >
          {lojasDisponiveis.map((loja) => (
            <option key={loja.id} value={loja.id ?? ""}>
              {loja.nome}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {lojasDisponiveis.length === 1
          ? "1 loja disponível"
          : `${lojasDisponiveis.length} lojas disponíveis`}
      </span>
    </div>
  );
}
