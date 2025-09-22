"use client";

import { useEffect, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import type { InventoryVehicle } from "../../../../backend/fixtures";
import { getVehicleByPlate, listVehicles, saveVehicle } from "../../../../backend/modules/estoque";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function InventoryPage() {
  const [filter, setFilter] = useState("");
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadVehicles = async () => {
      setIsLoading(true);
      const data = await listVehicles.mock({ search: filter });
      if (!cancelled) {
        setVehicles(data);
        setIsLoading(false);
      }
    };

    void loadVehicles();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const handleCreate = async () => {
    await saveVehicle.mock({
      placa: "NOVO-0000",
      modelo_id: undefined,
      estado_venda: "disponivel"
    });
    // TODO: chamar listVehicles.run após integrar com o backend real.
  };

  const handleFilter = (value: string) => {
    setFilter(value);
  };

  const handleDetails = async (placa: string) => {
    const vehicle = await getVehicleByPlate.mock({ placa });
    console.info("Detalhe", vehicle);
  };

  const formatCurrency = (value: number | null) => {
    if (value == null) return "Sem preço";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "disponivel":
        return "Disponível";
      case "reservado":
        return "Reservado";
      case "em_preparacao":
        return "Em preparação";
      case "vendido":
        return "Vendido";
      default:
        return status;
    }
  };

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
          {isLoading ? (
            <p className="text-sm text-slate-400">Carregando veículos...</p>
          ) : vehicles.length > 0 ? (
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
                  <Button variant="ghost" className="justify-start px-2 text-sm" onClick={() => handleDetails(placa)}>
                    Detalhes
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Nenhum veículo encontrado para o filtro atual.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
