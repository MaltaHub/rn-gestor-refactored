"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const inventory = [
  { placa: "ABC2D34", modelo: "Compass Longitude 2.0", status: "Disponível", preco: "R$ 142.900" },
  { placa: "XYZ1H22", modelo: "Civic Touring", status: "Reservado", preco: "R$ 158.500" },
  { placa: "KLM5P90", modelo: "HR-V EXL", status: "Em preparação", preco: "R$ 139.000" }
];

export default function InventoryPage() {
  const [filter, setFilter] = useState("");

  const handleCreate = () => {
    // action: direcionar para criação de veículo (ex: router.push ou modal de cadastro)
    console.info("Criar veículo acionado");
  };

  const handleFilter = (value: string) => {
    setFilter(value);
    // action: substituir por filtro conectado ao backend ou store local
  };

  const filteredInventory = inventory.filter(({ modelo, placa }) => {
    const query = filter.toLowerCase();
    return modelo.toLowerCase().includes(query) || placa.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão de estoque"
        description="Dados prontos para conectar com serviços de inventário, armazenagem e análises."
        actions={
          <Button className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Novo veículo
          </Button>
        }
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-4">
          <CardTitle>Filtros rápidos</CardTitle>
          <CardDescription>Preparado para ser ligado ao motor de busca e filtros avançados.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              value={filter}
              onChange={(event) => handleFilter(event.target.value)}
              placeholder="Buscar por placa ou modelo"
              className="h-11 flex-1 border-0 bg-transparent px-0 focus:border-0 focus:ring-0"
            />
          </div>
          <Button variant="outline" className="gap-2 text-sm">
            <SlidersHorizontal className="h-4 w-4" />
            Ajustar filtros
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader>
          <CardTitle>Veículos</CardTitle>
          <CardDescription>Esta grade pode ser substituída por tabela ou cards dinâmicos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredInventory.map(({ placa, modelo, status, preco }) => (
              <div key={placa} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{placa}</span>
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-200">{status}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{modelo}</p>
                  <p className="text-xs text-slate-400">{preco}</p>
                </div>
                <Button
                  variant="ghost"
                  className="justify-start px-2 text-sm"
                  onClick={() => {
                    // action: abrir visão detalhada do veículo selecionado
                    console.info("Detalhe", placa);
                  }}
                >
                  Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
