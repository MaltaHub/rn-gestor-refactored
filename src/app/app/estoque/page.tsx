"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface InventoryVehicle {
  id: string;
  placa: string;
  modelo_nome: string;
  estado_venda: string;
  preco_venal: number | null;
}

const inventoryVehicles: InventoryVehicle[] = [
  { id: "veh-01", placa: "BRA2E19", modelo_nome: "Jeep Compass Longitude", estado_venda: "disponivel", preco_venal: 189900 },
  { id: "veh-02", placa: "XYZ1A23", modelo_nome: "Toyota Corolla Altis", estado_venda: "reservado", preco_venal: 152000 },
  { id: "veh-03", placa: "QWE9Z87", modelo_nome: "Fiat Pulse Audace", estado_venda: "disponivel", preco_venal: 112500 },
  { id: "veh-04", placa: "HJK4L56", modelo_nome: "Chevrolet Onix", estado_venda: "vendido", preco_venal: 86500 }
];

export default function InventoryPage() {
  const [filter, setFilter] = useState("");

  const vehicles = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return inventoryVehicles;
    return inventoryVehicles.filter(
      ({ placa, modelo_nome }) => placa.toLowerCase().includes(query) || modelo_nome.toLowerCase().includes(query)
    );
  }, [filter]);

  const handleCreate = () => {
    console.info("Novo veiculo", { placa: "NOVO-0000" });
  };

  const formatCurrency = (value: number | null) => {
    if (value == null) return "Sem preco";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "disponivel":
        return "Disponivel";
      case "reservado":
        return "Reservado";
      case "em_preparacao":
        return "Em preparacao";
      case "vendido":
        return "Vendido";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestao de estoque"
        description="Dados prontos para conectar com servicos de inventario, armazenagem e analises."
        actions={
          <Button className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Novo veiculo
          </Button>
        }
      />

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="gap-4">
          <CardTitle>Filtros rapidos</CardTitle>
          <CardDescription>Preparado para ser ligado ao motor de busca e filtros avancados.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
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
          <CardTitle>Veiculos</CardTitle>
          <CardDescription>Esta grade pode ser substituida por tabela ou cards dinamicos.</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map(({ id, placa, modelo_nome, estado_venda, preco_venal }) => (
                <div key={id} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{placa}</span>
                    <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-200">
                      {formatStatus(estado_venda)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{modelo_nome}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(preco_venal)}</p>
                  </div>
                  <Button variant="ghost" className="justify-start px-2 text-sm">
                    Detalhes
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Nenhum veiculo encontrado para o filtro atual.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
