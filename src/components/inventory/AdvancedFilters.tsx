import { Utils } from "@/types"

type AdvancedFilterState = Utils.AdvancedFilterState

type NumericFilterKey =
  | "priceMin"
  | "priceMax"
  | "yearMin"
  | "yearMax"
  | "mileageMin"
  | "mileageMax"

type Props = {
  filters: AdvancedFilterState
  setFilters: (filters: AdvancedFilterState) => void
  onClear: () => void
  isOpen: boolean
  toggleOpen: () => void
}

const NUMERIC_FIELDS: Array<{ label: string; key: NumericFilterKey }> = [
  { label: "Preco minimo", key: "priceMin" },
  { label: "Preco maximo", key: "priceMax" },
  { label: "Ano minimo", key: "yearMin" },
  { label: "Ano maximo", key: "yearMax" },
  { label: "KM minimo", key: "mileageMin" },
  { label: "KM maximo", key: "mileageMax" },
]

export function AdvancedFilters({ filters, setFilters, onClear, isOpen, toggleOpen }: Props) {
  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  const handleNumericChange = (key: NumericFilterKey, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-6">
      <button
        onClick={toggleOpen}
        className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white shadow-lg transition hover:from-blue-600 hover:to-indigo-700"
      >
        <span className="text-lg font-bold">Filtros avancados</span>
        <span className="text-xl">{isOpen ? "-" : "+"}</span>
      </button>

      {isOpen && (
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6 shadow-inner">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {NUMERIC_FIELDS.map(({ label, key }) => (
              <div key={key}>
                <label className="mb-1 block font-semibold text-gray-700">{label}</label>
                <input
                  type="number"
                  value={filters[key]}
                  onChange={(event) => handleNumericChange(key, event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              className="rounded-lg border border-gray-300 p-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filters.local}
              onChange={(event) => setFilters({ ...filters, local: event.target.value })}
            >
              <option value="">Todos os locais</option>
              <option value="Oficina">Oficina</option>
              <option value="Funilaria">Funilaria</option>
              <option value="Polimento">Polimento</option>
            </select>

            <select
              className="rounded-lg border border-gray-300 p-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filters.hasIndicadores}
              onChange={(event) => setFilters({ ...filters, hasIndicadores: event.target.value })}
            >
              <option value="">Todos indicadores</option>
              <option value="true">Com indicadores</option>
              <option value="false">Sem indicadores</option>
            </select>

            <select
              className="rounded-lg border border-gray-300 p-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filters.hasPhotos}
              onChange={(event) => setFilters({ ...filters, hasPhotos: event.target.value })}
            >
              <option value="">Todas fotos</option>
              <option value="true">Tem fotos</option>
              <option value="false">Sem fotos</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="rounded-lg bg-red-500 px-4 py-2 text-white shadow transition hover:bg-red-600"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
