import { Utils } from "../../types";

// Definindo um alias para o tipo AdvancedFilterState
type AdvancedFilterState = Utils.AdvancedFilterState;

interface Props {
  filters: AdvancedFilterState;
  setFilters: (f: AdvancedFilterState) => void;
  onClear: () => void;
  isOpen: boolean;
  toggleOpen: () => void;
}

export function AdvancedFilters({ filters, setFilters, onClear, isOpen, toggleOpen }: Props) {
  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="space-y-6">
      {/* Botão colapsar */}
      <button
        onClick={toggleOpen}
        className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
      >
        <span className="font-bold text-lg">Filtros Avançados</span>
        <span className="text-xl">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-inner border border-gray-200 space-y-6">
          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Preço Mín", key: "priceMin" },
              { label: "Preço Máx", key: "priceMax" },
              { label: "Ano Mín", key: "yearMin" },
              { label: "Ano Máx", key: "yearMax" },
              { label: "KM Mín", key: "mileageMin" },
              { label: "KM Máx", key: "mileageMax" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block font-semibold text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={(filters as any)[key]}
                  onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>

          {/* Seletores */}
          <div className="flex flex-wrap gap-4">
            <select
              className="p-2 rounded-lg border border-gray-300 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filters.local}
              onChange={(e) => setFilters({ ...filters, local: e.target.value })}
            >
              <option value="">Todos os Locais</option>
              <option value="Oficina">Oficina</option>
              <option value="Funilaria">Funilaria</option>
              <option value="Polimento">Polimento</option>
            </select>

            <select
              className="p-2 rounded-lg border border-gray-300 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filters.hasIndicadores}
              onChange={(e) => setFilters({ ...filters, hasIndicadores: e.target.value })}
            >
              <option value="">Todos Indicadores</option>
              <option value="true">Com Indicadores</option>
              <option value="false">Sem Indicadores</option>
            </select>

            <select
              className="p-2 rounded-lg border border-gray-300 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filters.hasPhotos}
              onChange={(e) => setFilters({ ...filters, hasPhotos: e.target.value })}
            >
              <option value="">Todas Fotos</option>
              <option value="true">Tem Fotos</option>
              <option value="false">Sem Fotos</option>
            </select>
          </div>

          {/* Limpar filtros */}
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
