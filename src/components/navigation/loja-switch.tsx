"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import { clsx } from "clsx";

export interface LojaOption {
  id: string;
  nome: string;
  cidade?: string;
  uf?: string | null;
}

interface LojaSwitchProps {
  lojas: LojaOption[];
  value?: string | null;
  onChange?: (lojaId: string) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
}

export function LojaSwitch({ lojas, value, onChange, isLoading = false, className }: LojaSwitchProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    if (!onChange) return;
    setIsSubmitting(true);
    try {
      await onChange(nextValue);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <label
      className={clsx(
        "flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300",
        className
      )}
    >
      <ChevronsUpDown className="h-3 w-3 text-slate-500" />
      <span className="uppercase tracking-[0.2em] text-slate-500">Loja</span>
      <select
        value={value ?? ""}
        onChange={handleChange}
        disabled={isLoading || isSubmitting || lojas.length === 0}
        className="flex-1 appearance-none bg-transparent text-sm font-semibold text-slate-100 focus:outline-none"
      >
        {lojas.length === 0 ? <option value="">Nenhuma loja</option> : null}
        {lojas.map((loja) => (
          <option key={loja.id} value={loja.id} className="bg-slate-900 text-slate-900">
            {loja.nome}
            {loja.cidade ? ` • ${loja.cidade}${loja.uf ? `/${loja.uf}` : ""}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
