import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PriceInfoProps {
  precoLoja?: string | null;
  precoVeiculo?: string | null;
  showConsultantInfo?: boolean;
  onToggleConsultantInfo?: () => void;
  consultantInfoVisible?: boolean;
  showSellButton?: boolean;
  sellHref?: string;
}

export function PriceInfo({
  precoLoja,
  precoVeiculo,
  showConsultantInfo = false,
  onToggleConsultantInfo,
  consultantInfoVisible = false,
  showSellButton = false,
  sellHref,
}: PriceInfoProps) {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl border border-green-100 dark:border-green-900/40 bg-gradient-to-br from-white via-green-50 to-white dark:from-gray-900 dark:via-green-900/10 dark:to-gray-900">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Valores do anúncio
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Compartilhe o preço oficial com o cliente. Informações internas ficam ocultas por padrão.
          </p>
          {showSellButton && sellHref && consultantInfoVisible && (
            <Button
              asChild
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:bg-green-500 dark:hover:bg-green-400"
            >
              <Link href={sellHref}>
                Iniciar venda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {showConsultantInfo && onToggleConsultantInfo && (
          <button
            type="button"
            onClick={onToggleConsultantInfo}
            className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-700 shadow-sm transition hover:border-green-300 hover:text-green-800 dark:border-green-900/60 dark:bg-green-900/10 dark:text-green-200"
          >
            {consultantInfoVisible ? (
              <>
                <EyeOff className="h-4 w-4" />
                Ocultar visão consultor
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Ver visão consultor
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-green-200/70 bg-white p-5 shadow-sm dark:border-green-900/40 dark:bg-green-900/20">
          <span className="text-xs font-medium uppercase tracking-wide text-green-600 dark:text-green-300">
            Preço exibido no anúncio
          </span>
          <p className="mt-2 text-4xl font-bold text-green-700 dark:text-green-300">
            {precoLoja ?? "Não definido"}
          </p>
          <p className="mt-2 text-sm text-green-700/80 dark:text-green-200/80">
            Valor que o cliente vê na vitrine e canais integrados.
          </p>
        </div>

        {consultantInfoVisible ? (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-900/20">
            <span className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-300">
              Preço interno (estoque)
            </span>
            <p className="mt-2 text-3xl font-semibold text-amber-700 dark:text-amber-200">
              {precoVeiculo ?? "Não informado"}
            </p>
            <p className="mt-2 text-sm text-amber-800/80 dark:text-amber-200/80">
              Referência para negociação e margem do consultor.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-gray-500 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
            <p className="text-sm font-medium">
              Informações internas disponíveis apenas para consultores.
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide">
              Solicite acesso ao seu administrador se necessário.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
