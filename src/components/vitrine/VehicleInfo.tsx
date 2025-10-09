import { Card } from "@/components/ui/card";
import type { VeiculoUI } from "@/adapters/adaptador-estoque";

interface VehicleInfoProps {
  veiculo: VeiculoUI;
  dataEntrada?: string;
}

export function VehicleInfo({ veiculo, dataEntrada }: VehicleInfoProps) {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Informações principais
      </h2>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Modelo</dt>
          <dd className="text-gray-600 dark:text-gray-400">{veiculo.modeloDisplay}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Placa</dt>
          <dd className="text-gray-600 dark:text-gray-400">{veiculo.placa}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Ano</dt>
          <dd className="text-gray-600 dark:text-gray-400">{veiculo.anoPrincipal ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Hodômetro</dt>
          <dd className="text-gray-600 dark:text-gray-400">{veiculo.hodometroFormatado ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Estado do veículo</dt>
          <dd className="text-gray-600 dark:text-gray-400">{veiculo.estadoVeiculoLabel}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Documentação</dt>
          <dd className="text-gray-600 dark:text-gray-400">{veiculo.estagio_documentacao ?? "Sem informação"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Local atual</dt>
          <dd className="text-gray-600 dark:text-gray-400">{veiculo.localDisplay ?? "Sem local"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Disponível desde</dt>
          <dd className="text-gray-600 dark:text-gray-400">{dataEntrada ?? "—"}</dd>
        </div>
      </dl>
    </Card>
  );
}
