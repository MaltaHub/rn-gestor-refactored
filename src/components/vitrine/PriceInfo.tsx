import { Card } from "@/components/ui/card";

interface PriceInfoProps {
  precoLoja?: string | null;
  precoVeiculo?: string | null;
}

export function PriceInfo({ precoLoja, precoVeiculo }: PriceInfoProps) {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Valores</h2>
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Preço na loja
          </span>
          <p className="text-gray-600 dark:text-gray-400">{precoLoja ?? "Não definido"}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Preço padrão (veículo)
          </span>
          <p className="text-gray-600 dark:text-gray-400">{precoVeiculo ?? "Não informado"}</p>
        </div>
      </div>
    </Card>
  );
}
