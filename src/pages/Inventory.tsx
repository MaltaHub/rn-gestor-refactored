import { useState, useMemo } from "react";
import { AdvancedFilters } from "../components/inventory/AdvancedFilters";
import { VehicleList } from "../components/inventory/VehicleList";
import { Utils, Tabelas } from "./../types";

type Veiculo = Tabelas.Veiculo;
type AdvancedFilterState = Utils.AdvancedFilterState;

const initialVehicles: Veiculo[] = [
  {
    id: "1",
    placa: "ABC-1234",
    modelo_id: "Civic",
    local: "Oficina",
    hodometro: 15000,
    estagio_documentacao: "Regular",
    estado_venda: "disponivel",
    estado_veiculo: "seminovo",
    cor: "Preto",
    preco_venda: 90000,
    chassi: "9BWZZZ377VT004251",
    ano_modelo: 2020,
    ano_fabricacao: 2019,
    registrado_por: "admin",
    registrado_em: new Date().toISOString(),
    editado_por: null,
    editado_em: null,
    repetido_id: null,
    observacao: "Nenhuma observação",
  },
  {
    id: "2",
    placa: "XYZ-5678",
    modelo_id: "Corolla",
    local: "Funilaria",
    hodometro: 30000,
    estagio_documentacao: "Pendente",
    estado_venda: "vendido",
    estado_veiculo: "usado",
    cor: "Prata",
    preco_venda: 85000,
    chassi: null,
    ano_modelo: 2018,
    ano_fabricacao: 2017,
    registrado_por: "user",
    registrado_em: new Date().toISOString(),
    editado_por: null,
    editado_em: null,
    repetido_id: null,
    observacao: null,
  },
];

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
  const [filters, setFilters] = useState<AdvancedFilterState>(initialFilters);
  const [isOpen, setIsOpen] = useState(true);

  const filteredVehicles = useMemo(() => {
    return initialVehicles.filter((vehicle) => {
      if (filters.priceMin && (vehicle.preco_venda ?? 0) < Number(filters.priceMin)) return false;
      if (filters.priceMax && (vehicle.preco_venda ?? 0) > Number(filters.priceMax)) return false;
      if (filters.yearMin && (vehicle.ano_modelo ?? 0) < Number(filters.yearMin)) return false;
      if (filters.yearMax && (vehicle.ano_modelo ?? 0) > Number(filters.yearMax)) return false;
      if (filters.mileageMin && vehicle.hodometro < Number(filters.mileageMin)) return false;
      if (filters.mileageMax && vehicle.hodometro > Number(filters.mileageMax)) return false;
      if (filters.local && vehicle.local !== filters.local) return false;
      if (filters.documentacao && vehicle.estagio_documentacao !== filters.documentacao) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <AdvancedFilters
        filters={filters}
        setFilters={setFilters}
        onClear={() => setFilters(initialFilters)}
        isOpen={isOpen}
        toggleOpen={() => setIsOpen(!isOpen)}
      />
      <VehicleList vehicles={filteredVehicles} />
    </div>
  );
};
