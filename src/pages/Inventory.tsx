import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AdvancedFilters } from "../components/inventory/AdvancedFilters";
import { VehicleList } from "../components/inventory/VehicleList";
import { useVehicles } from "../hooks/useVehicles";
import { Utils } from "./../types";

type AdvancedFilterState = Utils.AdvancedFilterState;

const initialFilters: AdvancedFilterState = {
  priceMin: "",
  priceMax: "",
  yearMin: "",
  yearMax: "",
  mileageMin: "",
  mileageMax: "",
  local: "",
  documentacao: "",
  hasIndicadores: "",
  hasPhotos: "",
};

export const Inventory = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AdvancedFilterState>(initialFilters);
  const [isOpen, setIsOpen] = useState(true);

  // Hook que pega veículos do backend
  const { data: vehicles = [], isLoading, error } = useVehicles();

  // Aplica filtros em cima do resultado do Supabase
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (filters.priceMin && (vehicle.preco_venda ?? 0) < Number(filters.priceMin)) return false;
      if (filters.priceMax && (vehicle.preco_venda ?? 0) > Number(filters.priceMax)) return false;
      if (filters.yearMin && (vehicle.ano_modelo ?? 0) < Number(filters.yearMin)) return false;
      if (filters.yearMax && (vehicle.ano_modelo ?? 0) > Number(filters.yearMax)) return false;
      if (filters.mileageMin && vehicle.hodometro < Number(filters.mileageMin)) return false;
      if (filters.mileageMax && vehicle.hodometro > Number(filters.mileageMax)) return false;
      if (filters.local && vehicle.local?.nome !== filters.local) return false;
      if (filters.documentacao && vehicle.estagio_documentacao !== filters.documentacao) return false;
      return true;
    });
  }, [filters, vehicles]);

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white"
    >
      {/* Cabeçalho */}
      <header className="flex justify-between items-center px-8 py-4 bg-slate-950/70 shadow-lg">
        <h1 className="text-2xl font-bold">Inventário de Veículos</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/editar")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-md transition"
          >
            Editar
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md shadow-md transition"
          >
            Início
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
        {error && <p className="text-red-400">Erro ao carregar veículos.</p>}
        {isLoading && <p className="text-gray-400">Carregando veículos...</p>}

        <AdvancedFilters
          filters={filters}
          setFilters={setFilters}
          onClear={() => setFilters(initialFilters)}
          isOpen={isOpen}
          toggleOpen={() => setIsOpen(!isOpen)}
        />

        <VehicleList vehicles={filteredVehicles} />
      </main>
    </div>
  );
};
