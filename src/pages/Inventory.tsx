import { useState, useMemo } from "react";

export interface Vehicle {
  id: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  store: string;
  documentacao?: string;
  hasIndicadores?: boolean;
  images?: string[];
}

export interface AdvancedFilterState {
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  mileageMin: string;
  mileageMax: string;
  local: string;
  documentacao: string;
  hasIndicadores: string;
  hasPhotos: string;
}

const initialVehicles: Vehicle[] = [
  { id: '1', model: 'Honda Civic', year: 2020, price: 90000, mileage: 15000, store: 'Oficina', hasIndicadores: true, images: ['img1'] },
  { id: '2', model: 'Toyota Corolla', year: 2018, price: 85000, mileage: 30000, store: 'Funilaria', hasIndicadores: false, images: [] },
  { id: '3', model: 'Fiat Uno', year: 2015, price: 35000, mileage: 80000, store: 'Polimento', hasIndicadores: true, images: ['img2'] },
];

export const Inventory = () => {
  const [filters, setFilters] = useState<AdvancedFilterState>({
    priceMin: '',
    priceMax: '',
    yearMin: '',
    yearMax: '',
    mileageMin: '',
    mileageMax: '',
    local: '',
    documentacao: '',
    hasIndicadores: '',
    hasPhotos: ''
  });
  const [isOpen, setIsOpen] = useState(true);

  const filteredVehicles = useMemo(() => {
    return initialVehicles.filter(vehicle => {
      if (filters.priceMin && vehicle.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && vehicle.price > Number(filters.priceMax)) return false;
      if (filters.yearMin && vehicle.year < Number(filters.yearMin)) return false;
      if (filters.yearMax && vehicle.year > Number(filters.yearMax)) return false;
      if (filters.mileageMin && vehicle.mileage < Number(filters.mileageMin)) return false;
      if (filters.mileageMax && vehicle.mileage > Number(filters.mileageMax)) return false;
      if (filters.local && vehicle.store !== filters.local) return false;
      if (filters.documentacao && vehicle.documentacao !== filters.documentacao) return false;
      if (filters.hasIndicadores === "true" && !vehicle.hasIndicadores) return false;
      if (filters.hasIndicadores === "false" && vehicle.hasIndicadores) return false;
      if (filters.hasPhotos === "true" && (!vehicle.images || vehicle.images.length === 0)) return false;
      if (filters.hasPhotos === "false" && vehicle.images && vehicle.images.length > 0) return false;
      return true;
    });
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      yearMin: '',
      yearMax: '',
      mileageMin: '',
      mileageMax: '',
      local: '',
      documentacao: '',
      hasIndicadores: '',
      hasPhotos: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Botão colapsar filtros */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
      >
        <span className="font-bold text-lg">Filtros Avançados</span>
        <span className="text-xl">{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Filtros */}
      {isOpen && (
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-inner border border-gray-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Preço Mín / Máx */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Preço Mín</label>
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Preço Máx</label>
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Ano Mín / Máx */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Ano Mín</label>
              <input
                type="number"
                value={filters.yearMin}
                onChange={(e) => setFilters({...filters, yearMin: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Ano Máx</label>
              <input
                type="number"
                value={filters.yearMax}
                onChange={(e) => setFilters({...filters, yearMax: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* KM */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">KM Mín</label>
              <input
                type="number"
                value={filters.mileageMin}
                onChange={(e) => setFilters({...filters, mileageMin: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">KM Máx</label>
              <input
                type="number"
                value={filters.mileageMax}
                onChange={(e) => setFilters({...filters, mileageMax: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Seletores */}
          <div className="flex flex-wrap gap-4">
            <select
              className="p-2 rounded-lg border border-gray-300 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filters.local}
              onChange={(e) => setFilters({...filters, local: e.target.value})}
            >
              <option value="">Todos os Locais</option>
              <option value="Oficina">Oficina</option>
              <option value="Funilaria">Funilaria</option>
              <option value="Polimento">Polimento</option>
            </select>

            <select
              className="p-2 rounded-lg border border-gray-300 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filters.hasIndicadores}
              onChange={(e) => setFilters({...filters, hasIndicadores: e.target.value})}
            >
              <option value="">Todos Indicadores</option>
              <option value="true">Com Indicadores</option>
              <option value="false">Sem Indicadores</option>
            </select>

            <select
              className="p-2 rounded-lg border border-gray-300 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filters.hasPhotos}
              onChange={(e) => setFilters({...filters, hasPhotos: e.target.value})}
            >
              <option value="">Todas Fotos</option>
              <option value="true">Tem Fotos</option>
              <option value="false">Sem Fotos</option>
            </select>
          </div>

          {/* Limpar filtros */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      {/* Lista de veículos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.length > 0 ? filteredVehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition">
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-xl text-indigo-600">{vehicle.model}</h3>
              <p className="text-gray-700">Ano: {vehicle.year}</p>
              <p className="text-gray-700">Preço: <span className="font-semibold text-green-600">R$ {vehicle.price.toLocaleString()}</span></p>
              <p className="text-gray-700">KM: {vehicle.mileage.toLocaleString()}</p>
              <p className="text-gray-700">Local: <span className="font-medium">{vehicle.store}</span></p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vehicle.hasIndicadores ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {vehicle.hasIndicadores ? "Com indicadores" : "Sem indicadores"}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vehicle.images?.length ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  {vehicle.images?.length ? "Tem fotos" : "Sem fotos"}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <p className="col-span-full text-center text-gray-500 text-lg font-medium">Nenhum veículo encontrado</p>
        )}
      </div>
    </div>
  );
};
