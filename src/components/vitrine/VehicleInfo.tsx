import { Card } from "@/components/ui/card";
import type { VeiculoUI } from "@/adapters/adaptador-estoque";

interface VehicleInfoProps {
  veiculo: VeiculoUI;
  dataEntrada?: string;
}

export function VehicleInfo({ veiculo, dataEntrada }: VehicleInfoProps) {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl border-l-4 border-l-blue-500">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Informações principais
      </h2>
      <dl className="grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Modelo</dt>
          <dd className="text-base font-medium text-gray-900 dark:text-gray-100">{veiculo.modeloDisplay}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Placa</dt>
          <dd className="text-base font-mono font-medium text-gray-900 dark:text-gray-100">{veiculo.placa}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ano</dt>
          <dd className="text-base font-medium text-gray-900 dark:text-gray-100">{veiculo.anoPrincipal ?? "—"}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hodômetro</dt>
          <dd className="text-base font-medium text-gray-900 dark:text-gray-100">{veiculo.hodometroFormatado ?? "—"}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado do veículo</dt>
          <dd className="text-base font-medium text-gray-900 dark:text-gray-100">{veiculo.estadoVeiculoLabel}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Documentação</dt>
          <dd className="text-base font-medium text-gray-900 dark:text-gray-100">{veiculo.estagio_documentacao ?? "Sem informação"}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Local atual</dt>
          <dd className="text-base font-medium text-gray-900 dark:text-gray-100">{veiculo.localDisplay ?? "Sem local"}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Disponível desde</dt>
          <dd className="text-base font-medium text-gray-900 dark:text-gray-100">{dataEntrada ?? "—"}</dd>
        </div>
      </dl>
    </Card>
  );
}
