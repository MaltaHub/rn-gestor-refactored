import { Card } from "@/components/ui/card";

interface PriceInfoProps {
  precoLoja?: string | null;
  precoVeiculo?: string | null;
}

export function PriceInfo({ precoLoja, precoVeiculo }: PriceInfoProps) {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Valores
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            Preço na loja
          </span>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {precoLoja ?? "Não definido"}
          </p>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            Preço do estoque
          </span>
          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            {precoVeiculo ?? "Não informado"}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
            Valor de referência do estoque
          </span>
        </div>
      </div>
    </Card>
  );
}
