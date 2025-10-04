// components/LojaSelector.tsx
"use client";

import { useEffect } from "react";

import { useLojaStore } from "@/stores/useLojaStore";
import { useLojas } from "@/hooks/use-configuracoes";

export function LojaSelector() {
  const { data: lojas = [], isLoading } = useLojas();
  const lojaSelecionada = useLojaStore((s) => s.lojaSelecionada);
  const setLojaSelecionada = useLojaStore((s) => s.setLojaSelecionada);

  useEffect(() => {
    if (!isLoading && lojas.length && !lojaSelecionada) {
      setLojaSelecionada(lojas[0]);
    }
  }, [isLoading, lojas, lojaSelecionada, setLojaSelecionada]);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Carregando lojas…</p>;
  }

  if (!lojas.length) {
    return <p className="text-sm text-red-500">Nenhuma loja encontrada</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="loja" className="text-sm font-medium text-zinc-700">
        Selecione uma Loja
      </label>
      <select
        id="loja"
        className="rounded border px-3 py-2"
        value={lojaSelecionada?.id ?? ""}
        onChange={(e) => {
          const loja = lojas.find((l) => l.id === e.target.value);
          if (loja) setLojaSelecionada(loja);
        }}
      >
        <option value="">-- Escolha --</option>
        {lojas.map((loja) => (
          <option key={loja.id} value={loja.id}>
            {loja.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
